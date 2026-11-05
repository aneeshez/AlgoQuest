import json
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
        response = client.post("/api/auth/register/", data=json.dumps({"username": "learner-one", "email": "learner@example.com", "password": "Trailblazer!2026"}), content_type="application/json", HTTP_X_CSRFTOKEN=token, HTTP_ORIGIN="http://127.0.0.1:5173")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["authenticated"])
        self.assertTrue(User.objects.get(username="learner-one").profile)

    def test_weak_password_is_rejected(self):
        response = self.client.post("/api/auth/register/", {"username": "learner-two", "email": "two@example.com", "password": "123"}, content_type="application/json")
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
