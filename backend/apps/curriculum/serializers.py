from rest_framework import serializers
from .models import LearningModule, Lesson

class LessonSummarySerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()
    bookmarked = serializers.SerializerMethodField()
    class Meta:
        model = Lesson
        fields = ["id", "title", "slug", "order", "duration_minutes", "difficulty", "xp_reward", "completed", "bookmarked"]
    def _progress(self, obj):
        user = self.context["request"].user
        return obj.learner_progress.filter(user=user).first() if user.is_authenticated else None
    def get_completed(self, obj):
        row = self._progress(obj)
        return bool(row and row.completed_at)
    def get_bookmarked(self, obj):
        row = self._progress(obj)
        return bool(row and row.bookmarked)

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSummarySerializer(many=True, read_only=True)
    class Meta:
        model = LearningModule
        fields = ["id", "number", "section", "title", "slug", "summary", "difficulty", "lessons"]

class LessonSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source="module.title", read_only=True)
    completed = serializers.SerializerMethodField()
    bookmarked = serializers.SerializerMethodField()
    class Meta:
        model = Lesson
        exclude = ["check_answer", "check_explanation"]
    def _progress(self, obj):
        user = self.context["request"].user
        return obj.learner_progress.filter(user=user).first() if user.is_authenticated else None
    def get_completed(self, obj):
        row = self._progress(obj)
        return bool(row and row.completed_at)
    def get_bookmarked(self, obj):
        row = self._progress(obj)
        return bool(row and row.bookmarked)
