# Stub migration - original was duplicate of 0115_auto_20260105_1406
# Kept for database compatibility (migration record exists in db)

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0115_rename_issueuserproperty_to_projectuserproperty'),
    ]

    operations = [
        # No operations - data migration already done by 0115_auto_20260105_1406
    ]
