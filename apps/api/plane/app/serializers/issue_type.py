# Module imports
from .base import BaseSerializer
from rest_framework import serializers

from plane.db.models import IssueType, ProjectIssueType


class IssueTypeSerializer(BaseSerializer):
    class Meta:
        model = IssueType
        fields = [
            "id",
            "workspace_id",
            "name",
            "description",
            "logo_props",
            "is_epic",
            "is_default",
            "is_active",
            "level",
        ]
        read_only_fields = ["workspace_id"]


class IssueTypeLiteSerializer(BaseSerializer):
    class Meta:
        model = IssueType
        fields = [
            "id",
            "name",
            "logo_props",
            "is_epic",
        ]
        read_only_fields = fields


class ProjectIssueTypeSerializer(BaseSerializer):
    issue_type_detail = IssueTypeLiteSerializer(source="issue_type", read_only=True)

    class Meta:
        model = ProjectIssueType
        fields = [
            "id",
            "project_id",
            "issue_type_id",
            "issue_type_detail",
            "level",
            "is_default",
        ]
        read_only_fields = ["project_id"]
