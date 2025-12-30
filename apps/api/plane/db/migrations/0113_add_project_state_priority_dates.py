# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0112_auto_20251124_0603"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="project_state",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("planning", "Planning"),
                    ("execution", "Execution"),
                    ("monitoring", "Monitoring"),
                    ("completed", "Completed"),
                    ("cancelled", "Cancelled"),
                ],
                default="draft",
                max_length=20,
                verbose_name="Project State",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="priority",
            field=models.CharField(
                blank=True,
                choices=[
                    ("urgent", "Urgent"),
                    ("high", "High"),
                    ("medium", "Medium"),
                    ("low", "Low"),
                    ("none", "None"),
                ],
                default="none",
                max_length=20,
                null=True,
                verbose_name="Project Priority",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="start_date",
            field=models.DateField(
                blank=True,
                null=True,
                verbose_name="Project Start Date",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="target_date",
            field=models.DateField(
                blank=True,
                null=True,
                verbose_name="Project Due Date",
            ),
        ),
    ]
