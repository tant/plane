# Generated manually to merge parallel migration branches

from django.db import migrations


class Migration(migrations.Migration):
    """
    Merge migration to combine two parallel branches:

    Branch A (custom features):
    0112 → 0113_add_project_state → 0114_add_project_updates
         → 0115_rename_issueuserproperty (stub) → 0116_migrate (stub)

    Branch B (upstream):
    0112 → 0113_webhook_version → 0114_projectuserproperty_delete
         → 0115_auto_20260105
    """

    dependencies = [
        ("db", "0115_auto_20260105_1406"),
        ("db", "0116_migrate_project_user_properties_data"),
    ]

    operations = [
        # No operations needed - this just merges the branches
    ]
