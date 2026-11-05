from django.contrib import admin
from .models import Badge, UserBadge, XPTransaction

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
