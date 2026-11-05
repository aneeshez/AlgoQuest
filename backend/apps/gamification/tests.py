from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from apps.gamification.models import XPTransaction


class BrowserCodeTaskRewardTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("coder", password="Trailblazer!2026")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_visible_code_task_reward_is_idempotent_and_capped(self):
        tasks = ["two-sum", "largest", "reverse", "binary-search"]
        for task in tasks:
            response = self.client.post("/api/points/code-task/", {"task": task, "amount": 9999}, format="json")
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()["awarded"])
            self.assertEqual(response.json()["amount"], 10)
        repeated = self.client.post("/api/points/code-task/", {"task": "two-sum"}, format="json")
        self.assertFalse(repeated.json()["awarded"])
        self.assertEqual(XPTransaction.objects.filter(user=self.user, reason="visible_code_task_completed").count(), 4)
        self.assertEqual(sum(XPTransaction.objects.filter(user=self.user, reason="visible_code_task_completed").values_list("amount", flat=True)), 40)
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.total_xp, 40)
        self.assertEqual(self.user.profile.streak_days, 1)

    def test_code_task_reward_requires_login_and_known_task(self):
        anonymous = APIClient().post("/api/points/code-task/", {"task": "two-sum"}, format="json")
        self.assertEqual(anonymous.status_code, 403)
        invalid = self.client.post("/api/points/code-task/", {"task": "unknown"}, format="json")
        self.assertEqual(invalid.status_code, 400)
        malformed = self.client.post("/api/points/code-task/", {"task": []}, format="json")
        self.assertEqual(malformed.status_code, 400)

    def test_code_task_reward_requires_csrf_for_session_users(self):
        client = APIClient(enforce_csrf_checks=True)
        client.force_login(self.user)
        rejected = client.post("/api/points/code-task/", {"task": "two-sum"}, format="json")
        self.assertEqual(rejected.status_code, 403)
        client.get("/api/auth/csrf/")
        token = client.cookies["csrftoken"].value
        accepted = client.post("/api/points/code-task/", {"task": "two-sum"}, format="json", HTTP_X_CSRFTOKEN=token)
        self.assertEqual(accepted.status_code, 200)
