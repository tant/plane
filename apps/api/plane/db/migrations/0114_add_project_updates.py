# Generated migration for Project Updates feature

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("db", "0113_add_project_state_priority_dates"),
    ]

    operations = [
        # Add is_project_updates_enabled and is_epic_enabled to Project model
        migrations.AddField(
            model_name="project",
            name="is_project_updates_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="project",
            name="is_epic_enabled",
            field=models.BooleanField(default=True),
        ),
        # Create ProjectUpdate model
        migrations.CreateModel(
            name="ProjectUpdate",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        db_index=True,
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                        unique=True,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("deleted_at", models.DateTimeField(blank=True, null=True, verbose_name="Deleted At")),
                ("title", models.CharField(max_length=255, verbose_name="Update Title")),
                ("description", models.TextField(blank=True, verbose_name="Update Description")),
                ("description_html", models.TextField(blank=True, null=True, verbose_name="Update Description HTML")),
                ("description_stripped", models.TextField(blank=True, null=True, verbose_name="Update Description Stripped")),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("progress", "Progress"),
                            ("milestone", "Milestone"),
                            ("blocker", "Blocker"),
                            ("general", "General"),
                        ],
                        default="general",
                        max_length=20,
                        verbose_name="Update Category",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_updates",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_projectupdate",
                        to="db.project",
                    ),
                ),
                (
                    "workspace",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="workspace_projectupdate",
                        to="db.workspace",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Update",
                "verbose_name_plural": "Project Updates",
                "db_table": "project_updates",
                "ordering": ("-created_at",),
            },
        ),
    ]
