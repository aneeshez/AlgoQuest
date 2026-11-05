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

    def test_story_quest_saves_each_correct_step_and_awards_once(self):
        self.assertEqual(self.client.get("/api/quests/network-rescue/").json(), {"currentStep": 0, "completed": False})
        wrong = self.client.post("/api/quests/network-rescue/step/", {"step": 0, "answer": "dfs"}, format="json")
        self.assertFalse(wrong.json()["correct"])
        skipped = self.client.post("/api/quests/network-rescue/step/", {"step": 1, "answer": "queue"}, format="json")
        self.assertEqual(skipped.status_code, 409)
        for step, answer in enumerate(["bfs", "queue", "binary-search"]):
            result = self.client.post("/api/quests/network-rescue/step/", {"step": step, "answer": answer}, format="json")
            self.assertEqual(result.status_code, 200)
        self.assertTrue(result.json()["completed"])
        self.assertEqual(result.json()["reward"], 15)
        replay = self.client.post("/api/quests/network-rescue/step/", {"step": 2, "answer": "binary-search"}, format="json")
        self.assertTrue(replay.json()["alreadyComplete"])
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.profile.total_xp, 15)
        self.assertEqual(XPTransaction.objects.filter(user=self.user, reason="story_quest_completed").count(), 1)
        self.assertEqual(self.client.get("/api/quests/network-rescue/").json(), {"currentStep": 3, "completed": True})

    def test_story_quest_steps_require_login(self):
        response = APIClient().post("/api/quests/network-rescue/step/", {"step": 0, "answer": "bfs"}, format="json")
        self.assertEqual(response.status_code, 403)
