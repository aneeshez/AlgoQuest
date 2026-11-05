from django.conf import settings
from django.db import models

class LearningModule(models.Model):
    class Section(models.TextChoices):
        BASICS = "basics", "Basics"
        MEDIUM = "medium", "Medium"
        ADVANCED = "advanced", "Advanced"

    number = models.PositiveSmallIntegerField(unique=True)
    section = models.CharField(max_length=12, choices=Section.choices, default=Section.BASICS)
    title = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    summary = models.TextField()
    difficulty = models.CharField(max_length=20, default="beginner")
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["number"]

class Lesson(models.Model):
    module = models.ForeignKey(LearningModule, related_name="lessons", on_delete=models.CASCADE)
    title = models.CharField(max_length=140)
    slug = models.SlugField()
    order = models.PositiveSmallIntegerField(default=0)
    duration_minutes = models.PositiveSmallIntegerField(default=10)
    difficulty = models.CharField(max_length=20, default="beginner")
    concept = models.TextField()
    analogy = models.TextField()
    demonstration = models.TextField()
    steps = models.JSONField(default=list)
    python_code = models.TextField(blank=True)
    code_explanation = models.TextField(blank=True)
    dry_run = models.JSONField(default=list)
    experiment_prompt = models.TextField(blank=True)
    check_question = models.TextField(blank=True)
    check_options = models.JSONField(default=list)
    check_answer = models.PositiveSmallIntegerField(default=0)
    check_explanation = models.TextField(blank=True)
    assignment_prompt = models.TextField(blank=True)
    xp_reward = models.PositiveSmallIntegerField(default=20)

    class Meta:
        ordering = ["module__number", "order"]
        constraints = [models.UniqueConstraint(fields=["module", "slug"], name="unique_lesson_slug_per_module")]

class LessonProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="learner_progress")
    completed_at = models.DateTimeField(null=True, blank=True)
    bookmarked = models.BooleanField(default=False)
    check_correct = models.BooleanField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "lesson"], name="unique_user_lesson_progress")]
