from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import LearningModule, Lesson, LessonProgress
from .serializers import LessonSerializer, ModuleSerializer
from apps.accounts.models import UserProfile
from apps.gamification.models import XPTransaction
from apps.gamification.services import award_lesson_badges
from apps.gamification.services import advance_activity_streak

class ModuleList(generics.ListAPIView):
    queryset = LearningModule.objects.filter(is_published=True).prefetch_related("lessons")
    serializer_class = ModuleSerializer
    permission_classes = [permissions.AllowAny]

class LessonDetail(generics.RetrieveAPIView):
    queryset = Lesson.objects.filter(module__is_published=True).select_related("module")
    serializer_class = LessonSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def lesson_progress(request, pk):
    try:
        lesson = Lesson.objects.get(pk=pk, module__is_published=True)
    except Lesson.DoesNotExist:
        return Response({"detail": "Lesson not found."}, status=404)
    action = request.data.get("action")
    if action not in {"complete", "bookmark", "unbookmark", "check"}:
        return Response({"detail": "Action must be complete, bookmark, unbookmark, or check."}, status=400)
    with transaction.atomic():
        progress, _ = LessonProgress.objects.select_for_update().get_or_create(user=request.user, lesson=lesson)
        if action == "bookmark":
            progress.bookmarked = True
            progress.save(update_fields=["bookmarked"])
        elif action == "unbookmark":
            progress.bookmarked = False
            progress.save(update_fields=["bookmarked"])
        elif action == "check":
            answer = request.data.get("answer")
            if not isinstance(answer, int) or isinstance(answer, bool):
                return Response({"detail": "Answer must be an option index."}, status=400)
            progress.check_correct = answer == lesson.check_answer
            progress.save(update_fields=["check_correct"])
            return Response({"correct": progress.check_correct, "explanation": lesson.check_explanation})
        elif not progress.completed_at:
            progress.completed_at = timezone.now()
            progress.save(update_fields=["completed_at"])
            XPTransaction.objects.get_or_create(user=request.user, activity_ref=f"lesson:{lesson.id}", defaults={"amount": lesson.xp_reward, "reason": "lesson_completed"})
            profile = UserProfile.objects.select_for_update().get(user=request.user)
            profile.total_xp = sum(request.user.xp_transactions.values_list("amount", flat=True))
            advance_activity_streak(profile)
            profile.save(update_fields=["total_xp", "streak_days", "longest_streak", "last_activity_date"])
        if action == "complete":
            award_lesson_badges(request.user)
    return Response({"completed": bool(progress.completed_at), "bookmarked": progress.bookmarked, "totalXp": request.user.profile.total_xp})
