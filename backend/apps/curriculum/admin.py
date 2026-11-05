from django.contrib import admin
from .models import LearningModule, Lesson

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0

@admin.register(LearningModule)
class LearningModuleAdmin(admin.ModelAdmin):
    list_display = ("number", "title", "difficulty", "is_published")
    list_editable = ("is_published",)
    search_fields = ("title", "summary")
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "module", "order", "difficulty")
    list_filter = ("module", "difficulty")
    search_fields = ("title", "concept")
