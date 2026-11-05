from django.conf import settings
from django.db import models

class XPTransaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="xp_transactions")
    activity_ref = models.CharField(max_length=160)
    amount = models.PositiveSmallIntegerField()
    reason = models.CharField(max_length=80)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "activity_ref"], name="unique_xp_award_per_activity")]
        indexes = [models.Index(fields=["user", "-created_at"])]
