import uuid

from django.contrib.auth.models import User
from django.test import Client, TestCase
from rest_framework.test import APIClient

from apps.gamification.models import NicknameReport, XPTransaction


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


class LeaderboardPrivacyAndReportingTests(TestCase):
    def setUp(self):
        self.reporter = User.objects.create_user("reporter", "reporter@example.com", "Trailblazer!2026")
        self.target = User.objects.create_user("target-private-login", "target-private@example.com", "Trailblazer!2026")
        self.target.profile.nickname = "Helpful Coder"
        self.target.profile.save(update_fields=["nickname"])
        XPTransaction.objects.create(user=self.target, activity_ref="weekly-score", amount=20, reason="lesson_completed")
        self.client = APIClient()

    def test_learner_can_hide_and_restore_public_leaderboard_entry(self):
        session_client = Client()
        session_client.force_login(self.target)
        hidden = session_client.patch("/api/profile/", {"leaderboardVisible": False}, content_type="application/json")
        self.assertEqual(hidden.status_code, 200)
        self.assertFalse(hidden.json()["leaderboardVisible"])
        self.assertEqual(session_client.get("/api/leaderboard/").json()["entries"], [])
        restored = session_client.patch("/api/profile/", {"leaderboardVisible": True}, content_type="application/json")
        self.assertTrue(restored.json()["leaderboardVisible"])
        entries = session_client.get("/api/leaderboard/").json()["entries"]
        self.assertEqual(entries[0]["nickname"], "Helpful Coder")
        self.assertTrue(entries[0]["isSelf"])
        self.assertNotIn("target-private-login", str(entries))
        self.assertNotIn("target-private@example.com", str(entries))
        self.assertIn("reportToken", entries[0])
        self.assertEqual(str(uuid.UUID(entries[0]["reportToken"])), entries[0]["reportToken"])
        self.assertNotEqual(entries[0]["reportToken"], str(self.target.id))

    def test_authenticated_user_can_report_once_with_opaque_token(self):
        entry = self.client.get("/api/leaderboard/").json()["entries"][0]
        self.client.force_authenticate(self.reporter)
        submitted = self.client.post("/api/leaderboard/report/", {"reportToken": entry["reportToken"], "category": "impersonation", "details": "This nickname appears to impersonate another learner."}, format="json")
        self.assertEqual(submitted.status_code, 201)
        report = NicknameReport.objects.get()
        self.assertEqual(report.reporter, self.reporter)
        self.assertEqual(report.target, self.target)
        self.assertEqual(report.status, NicknameReport.Status.OPEN)
        duplicate = self.client.post("/api/leaderboard/report/", {"reportToken": entry["reportToken"], "category": "other"}, format="json")
        self.assertEqual(duplicate.status_code, 409)

    def test_report_rejects_anonymous_self_and_invalid_requests(self):
        entry = self.client.get("/api/leaderboard/").json()["entries"][0]
        anonymous = self.client.post("/api/leaderboard/report/", {"reportToken": entry["reportToken"], "category": "other"}, format="json")
        self.assertEqual(anonymous.status_code, 403)
        self.client.force_authenticate(self.target)
        own_report = self.client.post("/api/leaderboard/report/", {"reportToken": entry["reportToken"], "category": "other"}, format="json")
        self.assertEqual(own_report.status_code, 400)
        invalid = self.client.post("/api/leaderboard/report/", {"reportToken": "tampered", "category": "other"}, format="json")
        self.assertEqual(invalid.status_code, 400)
        invalid_category = self.client.post("/api/leaderboard/report/", {"reportToken": entry["reportToken"], "category": "bad"}, format="json")
        self.assertEqual(invalid_category.status_code, 400)

    def test_report_submission_is_limited_to_five_per_day(self):
        for number in range(5):
            target = User.objects.create_user(f"reported-{number}", password="Trailblazer!2026")
            XPTransaction.objects.create(user=target, activity_ref=f"score-{number}", amount=20, reason="lesson_completed")
        entries = self.client.get("/api/leaderboard/").json()["entries"]
        self.client.force_authenticate(self.reporter)
        for entry in entries[:5]:
            result = self.client.post("/api/leaderboard/report/", {"reportToken": entry["reportToken"], "category": "other"}, format="json")
            self.assertEqual(result.status_code, 201)
        limited = self.client.post("/api/leaderboard/report/", {"reportToken": entries[5]["reportToken"], "category": "other"}, format="json")
        self.assertEqual(limited.status_code, 429)
