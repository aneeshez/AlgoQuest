from django.contrib import admin
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.accounts import views as account_views
from apps.curriculum import views as curriculum_views
from apps.gamification import views as gamification_views


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "service": "algoquest-api"})


urlpatterns = [
    path("admin/", admin.site.urls), path("api/health/", health, name="health"),
    path("api/auth/csrf/", account_views.csrf), path("api/auth/me/", account_views.me),
    path("api/auth/register/", account_views.register), path("api/auth/login/", account_views.sign_in), path("api/auth/logout/", account_views.sign_out),
    path("api/profile/", account_views.update_profile),
    path("api/modules/", curriculum_views.ModuleList.as_view()), path("api/lessons/<slug:slug>/", curriculum_views.LessonDetail.as_view()),
    path("api/leaderboard/", gamification_views.leaderboard),
    path("api/points/code-task/", gamification_views.award_code_task),
    path("api/quests/network-rescue/", gamification_views.quest_progress),
    path("api/quests/network-rescue/step/", gamification_views.quest_step),
    path("api/progress/lessons/<int:pk>/", curriculum_views.lesson_progress),
]
