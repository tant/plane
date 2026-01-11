# Stub migration - original was duplicate of 0114_projectuserproperty_delete_issueuserproperty_and_more
# Kept for database compatibility (migration record exists in db)

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0114_add_project_updates"),
    ]

    operations = [
        # No operations - schema changes already done by 0114_projectuserproperty_delete
    ]
