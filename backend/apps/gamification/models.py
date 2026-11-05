from django.conf import settings
from django.db import models
from django.utils import timezone

class XPTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="xp_transactions")
    activity_ref = models.CharField(max_length=160)
    amount = models.PositiveSmallIntegerField()
    reason = models.CharField(max_length=80)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "activity_ref"], name="unique_xp_award_per_activity")]
        indexes = [models.Index(fields=["user", "-created_at"])]


class Badge(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=180)
    lesson_threshold = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ["lesson_threshold", "slug"]


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="earned_badges")
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name="earners")
    earned_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "badge"], name="unique_badge_per_user")]
        ordering = ["earned_at", "badge__lesson_threshold"]


class QuestProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quest_progress")
    quest_slug = models.SlugField(max_length=80)
    current_step = models.PositiveSmallIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "quest_slug"], name="unique_user_quest_progress")]
