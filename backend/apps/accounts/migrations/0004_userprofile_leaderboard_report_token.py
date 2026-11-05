import uuid

from django.db import migrations, models


def populate_report_tokens(apps, schema_editor):
    UserProfile = apps.get_model("accounts", "UserProfile")
    for profile in UserProfile.objects.filter(leaderboard_report_token__isnull=True).iterator():
        profile.leaderboard_report_token = uuid.uuid4()
        profile.save(update_fields=["leaderboard_report_token"])


class Migration(migrations.Migration):
    dependencies = [("accounts", "0003_userprofile_leaderboard_visible")]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="leaderboard_report_token",
            field=models.UUIDField(null=True, editable=False),
        ),
        migrations.RunPython(populate_report_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="userprofile",
            name="leaderboard_report_token",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
