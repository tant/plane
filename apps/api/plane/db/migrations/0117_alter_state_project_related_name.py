# Generated manually to fix related_name conflict
# This migration merges the two migration branches and fixes the State.project related_name

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        # Merge both migration branches
        ("db", "0115_auto_20260105_1406"),
        ("db", "0116_migrate_project_user_properties_data"),
    ]

    operations = [
        migrations.AlterField(
            model_name="state",
            name="project",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="states",
                to="db.project",
            ),
        ),
    ]
