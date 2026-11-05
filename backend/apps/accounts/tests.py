import json
from datetime import timedelta
from django.core.cache import cache
from django.test import Client, TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from apps.gamification.models import XPTransaction

class SessionAuthenticationTests(TestCase):
    def test_registration_requires_csrf_and_creates_persisted_profile(self):
        client = Client(enforce_csrf_checks=True)
        client.get("/api/auth/csrf/")
        token = client.cookies["csrftoken"].value
        response = client.post("/api/auth/register/", data=json.dumps({"username": "learner-one", "nickname": "Quest Learner", "email": "learner@example.com", "password": "Trailblazer!2026"}), content_type="application/json", HTTP_X_CSRFTOKEN=token, HTTP_ORIGIN="http://127.0.0.1:5173")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        self.assertTrue(User.objects.get(username="learner-one").profile)
        self.assertEqual(User.objects.get(username="learner-one").profile.nickname, "Quest Learner")

    def test_weak_password_is_rejected(self):
        response = self.client.post("/api/auth/register/", {"username": "learner-two", "nickname": "Learner Two", "email": "two@example.com", "password": "123"}, content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username="learner-two").exists())

    def test_login_and_logout_use_real_django_session(self):
        User.objects.create_user("quester", "quester@example.com", "Trailblazer!2026")
        response = self.client.post("/api/auth/login/", {"username": "quester", "password": "Trailblazer!2026"}, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        response = self.client.post("/api/auth/logout/", {}, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["authenticated"])

    def test_repeated_login_attempts_are_rate_limited(self):
        cache.delete("auth-attempts:sign_in:127.0.0.1")
        for _ in range(10):
            response = self.client.post("/api/auth/login/", {"username": "missing", "password": "wrong"}, content_type="application/json")
            self.assertEqual(response.status_code, 400)
        response = self.client.post("/api/auth/login/", {"username": "missing", "password": "wrong"}, content_type="application/json")
        self.assertEqual(response.status_code, 429)

    def test_account_response_includes_real_seven_day_xp_activity(self):
        user = User.objects.create_user("activity-learner", "activity@example.com", "Trailblazer!2026")
        XPTransaction.objects.create(user=user, activity_ref="lesson:today", amount=25, reason="lesson_completed")
        self.client.force_login(user)
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.status_code, 200)
        activity = response.json()["profile"]["weeklyActivity"]
        self.assertEqual(len(activity), 7)
        self.assertEqual(activity[-1]["date"], timezone.localdate().isoformat())
        self.assertEqual(activity[-1]["xp"], 25)

    def test_profile_nickname_can_only_be_changed_by_authenticated_owner(self):
        user = User.objects.create_user("nickname-owner", "owner@example.com", "Trailblazer!2026")
        client = Client(enforce_csrf_checks=True)
        client.get("/api/auth/csrf/")
        token = client.cookies["csrftoken"].value
        anonymous = client.patch("/api/profile/", data=json.dumps({"nickname": "New Quest Name"}), content_type="application/json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(anonymous.status_code, 401)
        client.force_login(user)
        rejected = client.patch("/api/profile/", data=json.dumps({"nickname": "New Quest Name"}), content_type="application/json")
        self.assertEqual(rejected.status_code, 403)
        client.get("/api/auth/csrf/")
        token = client.cookies["csrftoken"].value
        updated = client.patch("/api/profile/", data=json.dumps({"nickname": "New Quest Name"}), content_type="application/json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(user.profile.__class__.objects.get(user=user).nickname, "New Quest Name")
        invalid = client.patch("/api/profile/", data=json.dumps({"nickname": "a"}), content_type="application/json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(invalid.status_code, 400)

    def test_public_leaderboard_uses_nicknames_and_current_week_points_only(self):
        first = User.objects.create_user("private-login-one", "private-one@example.com", "Trailblazer!2026")
        second = User.objects.create_user("private-login-two", "private-two@example.com", "Trailblazer!2026")
        first.profile.nickname = "Array Ace"
        first.profile.save(update_fields=["nickname"])
        second.profile.nickname = "Graph Guide"
        second.profile.save(update_fields=["nickname"])
        XPTransaction.objects.create(user=first, activity_ref="this-week", amount=30, reason="lesson_completed")
        XPTransaction.objects.create(user=second, activity_ref="this-week", amount=20, reason="lesson_completed")
        last_week = XPTransaction.objects.create(user=first, activity_ref="last-week", amount=100, reason="lesson_completed")
        XPTransaction.objects.filter(pk=last_week.pk).update(created_at=timezone.now() - timedelta(days=8))
        result = self.client.get("/api/leaderboard/")
        self.assertEqual(result.status_code, 200)
        self.assertEqual([entry["nickname"] for entry in result.json()["entries"]], ["Array Ace", "Graph Guide"])
        self.assertEqual([entry["weeklyXp"] for entry in result.json()["entries"]], [30, 20])
        self.assertNotIn("private-login-one", result.content.decode())
        self.assertNotIn("private-one@example.com", result.content.decode())
