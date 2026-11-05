from django.contrib import admin
from .models import Badge, NicknameReport, QuestProgress, UserBadge, XPTransaction


@admin.register(NicknameReport)
class NicknameReportAdmin(admin.ModelAdmin):
    list_display = ("target", "reporter", "category", "status", "created_at")
    list_filter = ("status", "category", "created_at")
    search_fields = ("target__username", "target__profile__nickname", "reporter__username", "details")
    readonly_fields = ("reporter", "target", "category", "details", "created_at")

@admin.register(XPTransaction)
class XPTransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "reason", "amount", "created_at")
    list_filter = ("reason", "created_at")
    search_fields = ("user__username", "activity_ref")


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ("name", "lesson_threshold", "slug")
    search_fields = ("name", "slug")


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ("user", "badge", "earned_at")
    list_filter = ("badge",)
    search_fields = ("user__username", "badge__name")


@admin.register(QuestProgress)
class QuestProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "quest_slug", "current_step", "completed_at", "updated_at")
    list_filter = ("quest_slug", "completed_at")
    search_fields = ("user__username", "quest_slug")
