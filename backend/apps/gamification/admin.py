from django.contrib import admin
from .models import XPTransaction

@admin.register(XPTransaction)
class XPTransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "reason", "amount", "created_at")
    list_filter = ("reason", "created_at")
    search_fields = ("user__username", "activity_ref")
