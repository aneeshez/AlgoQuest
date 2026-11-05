from datetime import timedelta
from django.contrib.auth.models import User
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import UserProfile
from apps.gamification.models import XPTransaction
from apps.gamification.models import Badge, UserBadge
from .models import LearningModule, Lesson, LessonProgress

class LessonProgressTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("student", password="Trailblazer!2026")
        self.module = LearningModule.objects.create(number=1, slug="foundations", title="Foundations", summary="Start here")
        self.lesson = Lesson.objects.create(module=self.module, slug="variables", title="Variables", concept="Names refer to values.", analogy="A labeled jar.", demonstration="Bind then update.", check_question="What is 2 + 2?", check_options=["3", "4"], check_answer=1, check_explanation="Addition gives four.", xp_reward=20)
        self.next_module = LearningModule.objects.create(number=8, section=LearningModule.Section.ADVANCED, slug="advanced", title="Advanced", summary="Build on the foundations")
        self.next_lesson = Lesson.objects.create(module=self.next_module, slug="big-o", title="Big O", concept="Growth", analogy="", demonstration="", check_question="", check_options=[], assignment_prompt="")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_every_published_section_is_open_but_progress_is_private(self):
        public = APIClient()
        modules = public.get("/api/modules/")
        self.assertEqual(modules.status_code, 200)
        self.assertEqual(modules.json()[1]["section"], "advanced")
        self.assertEqual(public.get(f"/api/lessons/{self.lesson.slug}/").status_code, 200)
        self.assertEqual(public.get(f"/api/lessons/{self.next_lesson.slug}/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/lessons/{self.next_lesson.slug}/").status_code, 200)
        self.assertEqual(public.post(f"/api/progress/lessons/{self.lesson.pk}/", {"action": "complete"}).status_code, 403)

    def test_completing_lesson_awards_experience_only_once(self):
        url = f"/api/progress/lessons/{self.lesson.pk}/"
        first = self.client.post(url, {"action": "complete"}, format="json")
        second = self.client.post(url, {"action": "complete"}, format="json")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(UserProfile.objects.get(user=self.user).total_xp, 20)
        self.assertEqual(UserProfile.objects.get(user=self.user).streak_days, 1)
        self.assertEqual(UserProfile.objects.get(user=self.user).last_activity_date, timezone.localdate())
        self.assertEqual(XPTransaction.objects.filter(user=self.user).count(), 1)
        self.assertEqual(LessonProgress.objects.filter(user=self.user).count(), 1)
        self.assertEqual(list(UserBadge.objects.filter(user=self.user).values_list("badge__slug", flat=True)), ["first-steps"])

    def test_consecutive_activity_advances_streak_and_longest_record(self):
        profile = self.user.profile
        profile.streak_days = 4
        profile.longest_streak = 4
        profile.last_activity_date = timezone.localdate() - timedelta(days=1)
        profile.save()
        self.client.post(f"/api/progress/lessons/{self.lesson.pk}/", {"action": "complete"}, format="json")
        profile.refresh_from_db()
        self.assertEqual(profile.streak_days, 5)
        self.assertEqual(profile.longest_streak, 5)
        self.assertEqual(profile.last_activity_date, timezone.localdate())

    def test_a_missed_day_restarts_current_streak_without_erasing_best(self):
        profile = self.user.profile
        profile.streak_days = 5
        profile.longest_streak = 8
        profile.last_activity_date = timezone.localdate() - timedelta(days=2)
        profile.save()
        self.client.post(f"/api/progress/lessons/{self.lesson.pk}/", {"action": "complete"}, format="json")
        profile.refresh_from_db()
        self.assertEqual(profile.streak_days, 1)
        self.assertEqual(profile.longest_streak, 8)

    def test_check_returns_explanation_without_exposing_answer_in_lesson_json(self):
        lesson_data = APIClient().get(f"/api/lessons/{self.lesson.slug}/").json()
        self.assertNotIn("check_answer", lesson_data)
        self.assertNotIn("check_explanation", lesson_data)
        result = self.client.post(f"/api/progress/lessons/{self.lesson.pk}/", {"action": "check", "answer": 1}, format="json")
        self.assertEqual(result.json(), {"correct": True, "explanation": "Addition gives four."})


class StarterCurriculumContentTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_curriculum", verbosity=0)

    def test_authored_lessons_have_executable_examples_and_valid_checks(self):
        authored = {
            "basics": ["Variables and values", "Conditions and decisions", "Loops and repetition", "Functions and decomposition", "Trace a small program", "Count the work", "Big O notation", "Time and space tradeoffs", "Best, average, and worst cases", "Array operations", "Linear and binary search", "Sorting fundamentals", "Two pointers", "Sliding window"],
            "medium": ["Dictionaries as lookup tables", "Set membership", "Frequency counting", "Hash maps and collisions"],
            "advanced": ["Binary tree anatomy", "Depth-first traversal", "Graph representations", "Breadth-first search"],
        }
        for section, titles in authored.items():
            lessons = list(Lesson.objects.filter(module__section=section, title__in=titles))
            self.assertEqual(len(lessons), len(titles), msg=f"Expected every listed lesson to be authored in {section}.")
            for lesson in lessons:
                self.assertNotIn("is a core idea", lesson.concept)
                self.assertTrue(lesson.analogy)
                self.assertTrue(lesson.steps)
                self.assertTrue(lesson.dry_run)
                self.assertTrue(lesson.assignment_prompt)
                self.assertEqual(len(lesson.check_options), 4)
                self.assertLess(lesson.check_answer, len(lesson.check_options))
                compile(lesson.python_code, f"{lesson.slug}.py", "exec")
