from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "nickname", "leaderboard_visible", "total_xp", "streak_days", "longest_streak")
    search_fields = ("user__username", "user__email")
