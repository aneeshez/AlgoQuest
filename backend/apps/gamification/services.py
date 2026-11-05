from datetime import timedelta

from django.utils import timezone

from .models import Badge, UserBadge, XPTransaction


def award_lesson_badges(user):
    completed = XPTransaction.objects.filter(user=user, reason="lesson_completed").count()
    eligible = Badge.objects.filter(lesson_threshold__lte=completed).exclude(earners__user=user)
    for badge in eligible:
        UserBadge.objects.get_or_create(user=user, badge=badge)


def advance_activity_streak(profile, today=None):
    today = today or timezone.localdate()
    if profile.last_activity_date == today:
        return False
    profile.streak_days = profile.streak_days + 1 if profile.last_activity_date == today - timedelta(days=1) else 1
    profile.longest_streak = max(profile.longest_streak, profile.streak_days)
    profile.last_activity_date = today
    return True
