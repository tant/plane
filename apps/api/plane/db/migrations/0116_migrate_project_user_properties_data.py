# Generated migration for migrating data to ProjectUserProperty

from django.db import migrations


def move_issue_user_properties_to_project_user_properties(apps, schema_editor):
    """
    Copy preferences and sort_order from ProjectMember to ProjectUserProperty
    """
    ProjectMember = apps.get_model('db', 'ProjectMember')
    ProjectUserProperty = apps.get_model('db', 'ProjectUserProperty')

    # Get all project members
    project_members = ProjectMember.objects.filter(deleted_at__isnull=True).values('member_id', 'project_id', 'preferences', 'sort_order')

    # Create a mapping with consistent ordering
    pm_dict = {
        (pm['member_id'], pm['project_id']): pm
        for pm in project_members
    }

    # Get all project user properties and update them
    properties_to_update = []
    for projectuserproperty in ProjectUserProperty.objects.filter(deleted_at__isnull=True):
        pm = pm_dict.get((projectuserproperty.user_id, projectuserproperty.project_id))
        if pm:
            projectuserproperty.preferences = pm['preferences']
            projectuserproperty.sort_order = pm['sort_order']
            properties_to_update.append(projectuserproperty)

    ProjectUserProperty.objects.bulk_update(properties_to_update, ['preferences', 'sort_order'], batch_size=2000)


class Migration(migrations.Migration):

    dependencies = [
        ('db', '0115_rename_issueuserproperty_to_projectuserproperty'),
    ]

    operations = [
        migrations.RunPython(
            move_issue_user_properties_to_project_user_properties,
            reverse_code=migrations.RunPython.noop
        ),
    ]
