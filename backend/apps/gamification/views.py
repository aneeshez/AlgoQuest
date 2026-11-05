from datetime import datetime, time, timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import UserBadge, XPTransaction
from apps.accounts.models import UserProfile


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
