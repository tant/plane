# Third party imports
from rest_framework import serializers

# Module imports
from plane.db.models import ProjectUpdate
from .base import BaseSerializer
from .user import UserLiteSerializer


class ProjectUpdateSerializer(BaseSerializer):
    """
    Serializer for project updates with author information.
    """

    created_by_detail = UserLiteSerializer(source="created_by", read_only=True)

    class Meta:
        model = ProjectUpdate
        fields = [
            "id",
            "title",
            "description",
            "description_html",
            "description_stripped",
            "category",
            "created_by",
            "created_by_detail",
            "created_at",
            "updated_at",
            "project",
            "workspace",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_by_detail",
            "created_at",
            "updated_at",
            "project",
            "workspace",
        ]


class ProjectUpdateCreateSerializer(BaseSerializer):
    """
    Serializer for creating project updates.
    """

    class Meta:
        model = ProjectUpdate
        fields = [
            "title",
            "description",
            "description_html",
            "description_stripped",
            "category",
        ]

    def create(self, validated_data):
        validated_data["project_id"] = self.context["project_id"]
        validated_data["workspace_id"] = self.context["workspace_id"]
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)
