from datetime import datetime, time, timedelta

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import QuestProgress, UserBadge, XPTransaction
from apps.accounts.models import UserProfile
from .services import advance_activity_streak

CODE_TASK_SLUGS = {"two-sum", "largest", "reverse", "binary-search"}
CODE_TASK_REWARD = 10
CODE_TASK_DAILY_LIMIT = 40


@api_view(["GET"])
@permission_classes([AllowAny])
def leaderboard(request):
    today = timezone.localdate()
    week_start = today - timedelta(days=today.weekday())
    start = timezone.make_aware(datetime.combine(week_start, time.min))
    end = timezone.make_aware(datetime.combine(week_start + timedelta(days=7), time.min))
    score_rows = list(
        UserProfile.objects.filter(user__xp_transactions__created_at__gte=start, user__xp_transactions__created_at__lt=end)
        .annotate(weekly_xp=Sum("user__xp_transactions__amount"))
        .order_by("-weekly_xp", "user_id")[:100]
        .values("user_id", "nickname", "weekly_xp")
    )
    user_ids = [row["user_id"] for row in score_rows]
    badges_by_user = {user_id: [] for user_id in user_ids}
    for row in UserBadge.objects.filter(user_id__in=user_ids).select_related("badge").order_by("badge__lesson_threshold", "badge__slug"):
        badges_by_user[row.user_id].append({"slug": row.badge.slug, "name": row.badge.name})
    entries = [
        {"rank": rank, "nickname": row["nickname"], "weeklyXp": row["weekly_xp"], "badges": badges_by_user[row["user_id"]]}
        for rank, row in enumerate(score_rows, start=1)
    ]
    return Response({"weekStart": week_start.isoformat(), "timezone": timezone.get_current_timezone_name(), "entries": entries})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def award_code_task(request):
    slug = request.data.get("task")
    if not isinstance(slug, str) or slug not in CODE_TASK_SLUGS:
        return Response({"detail": "Choose a supported coding task."}, status=400)
    today = timezone.localdate()
    activity_ref = f"code-task:{slug}:{today.isoformat()}"
    with transaction.atomic():
        profile = UserProfile.objects.select_for_update().get(user=request.user)
        existing = XPTransaction.objects.filter(user=request.user, activity_ref=activity_ref).first()
        if existing:
            return Response({"awarded": False, "amount": existing.amount, "detail": "Today's reward for this task was already collected."})
        earned_today = XPTransaction.objects.filter(user=request.user, reason="visible_code_task_completed", created_at__date=today).aggregate(total=Sum("amount"))["total"] or 0
        if earned_today + CODE_TASK_REWARD > CODE_TASK_DAILY_LIMIT:
            return Response({"detail": "You have reached today's coding-practice point limit."}, status=429)
        XPTransaction.objects.create(user=request.user, activity_ref=activity_ref, amount=CODE_TASK_REWARD, reason="visible_code_task_completed")
        profile.total_xp += CODE_TASK_REWARD
        advance_activity_streak(profile, today)
        profile.save(update_fields=["total_xp", "streak_days", "longest_streak", "last_activity_date"])
    return Response({"awarded": True, "amount": CODE_TASK_REWARD, "dailyLimit": CODE_TASK_DAILY_LIMIT})


QUEST_SLUG = "network-rescue"
QUEST_ANSWERS = ("bfs", "queue", "binary-search")
QUEST_FEEDBACK = (
    "Correct. BFS visits nearby stations first and finds the clinic using the fewest edges.",
    "Correct. A queue serves emergency requests in the order they arrived.",
    "Correct. Binary search halves the sorted inventory range at each check.",
)


@api_view(["GET"])
@permission_classes([AllowAny])
def quest_progress(request):
    if not request.user.is_authenticated:
        return Response({"currentStep": 0, "completed": False})
    progress, _ = QuestProgress.objects.get_or_create(user=request.user, quest_slug=QUEST_SLUG)
    return Response({"currentStep": progress.current_step, "completed": bool(progress.completed_at)})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def quest_step(request):
    step = request.data.get("step")
    answer = request.data.get("answer")
    if not isinstance(step, int) or isinstance(step, bool) or not isinstance(answer, str):
        return Response({"detail": "Send a step number and an answer."}, status=400)
    with transaction.atomic():
        progress, _ = QuestProgress.objects.select_for_update().get_or_create(user=request.user, quest_slug=QUEST_SLUG)
        if progress.completed_at:
            return Response({"correct": True, "currentStep": len(QUEST_ANSWERS), "completed": True, "alreadyComplete": True})
        if step != progress.current_step or step >= len(QUEST_ANSWERS) or step < 0:
            return Response({"detail": "That quest step is no longer current. Reload your quest progress."}, status=409)
        if answer != QUEST_ANSWERS[step]:
            return Response({"correct": False, "currentStep": progress.current_step, "completed": False})
        progress.current_step += 1
        if progress.current_step == len(QUEST_ANSWERS):
            progress.completed_at = timezone.now()
            XPTransaction.objects.get_or_create(user=request.user, activity_ref=f"quest:{QUEST_SLUG}", defaults={"amount": 15, "reason": "story_quest_completed"})
            profile = UserProfile.objects.select_for_update().get(user=request.user)
            profile.total_xp = sum(request.user.xp_transactions.values_list("amount", flat=True))
            advance_activity_streak(profile)
            profile.save(update_fields=["total_xp", "streak_days", "longest_streak", "last_activity_date"])
        progress.save(update_fields=["current_step", "completed_at", "updated_at"])
    return Response({"correct": True, "currentStep": progress.current_step, "completed": bool(progress.completed_at), "feedback": QUEST_FEEDBACK[step], "reward": 15 if progress.completed_at else 0})
