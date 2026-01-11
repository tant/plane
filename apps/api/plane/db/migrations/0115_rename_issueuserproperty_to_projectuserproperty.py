# Generated migration for renaming IssueUserProperty to ProjectUserProperty

from django.db import migrations, models
from django.conf import settings
import django.db.models.deletion
import plane.db.models.project


def get_default_preferences():
    return {"pages": {"block_display": True}, "navigation": {"default_tab": "work_items", "hide_in_more_menu": []}}


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("db", "0114_add_project_updates"),
    ]

    operations = [
        # Step 1: Rename table from issue_user_properties to project_user_properties
        migrations.AlterModelTable(
            name='issueuserproperty',
            table='project_user_properties',
        ),
        # Step 2: Rename model from IssueUserProperty to ProjectUserProperty
        migrations.RenameModel(
            old_name='IssueUserProperty',
            new_name='ProjectUserProperty',
        ),
        # Step 3: Add preferences field
        migrations.AddField(
            model_name='projectuserproperty',
            name='preferences',
            field=models.JSONField(default=plane.db.models.project.get_default_preferences),
        ),
        # Step 4: Add sort_order field
        migrations.AddField(
            model_name='projectuserproperty',
            name='sort_order',
            field=models.FloatField(default=65535),
        ),
        # Step 5: Update model options
        migrations.AlterModelOptions(
            name='projectuserproperty',
            options={'ordering': ('-created_at',), 'verbose_name': 'Project User Property', 'verbose_name_plural': 'Project User Properties'},
        ),
        # Step 6: Remove old constraint
        migrations.RemoveConstraint(
            model_name='projectuserproperty',
            name='issue_user_property_unique_user_project_when_deleted_at_null',
        ),
        # Step 7: Update user field related_name
        migrations.AlterField(
            model_name='projectuserproperty',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='project_property_user', to=settings.AUTH_USER_MODEL),
        ),
        # Step 8: Add new constraint with updated name
        migrations.AddConstraint(
            model_name='projectuserproperty',
            constraint=models.UniqueConstraint(condition=models.Q(('deleted_at__isnull', True)), fields=('user', 'project'), name='project_user_property_unique_user_project_when_deleted_at_null'),
        ),
    ]
