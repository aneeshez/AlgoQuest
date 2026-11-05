from .models import Badge, UserBadge, XPTransaction


def award_lesson_badges(user):
    completed = XPTransaction.objects.filter(user=user, reason="lesson_completed").count()
    eligible = Badge.objects.filter(lesson_threshold__lte=completed).exclude(earners__user=user)
    for badge in eligible:
        UserBadge.objects.get_or_create(user=user, badge=badge)
