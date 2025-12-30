# Third party modules
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.app.permissions import ProjectEntityPermission, ProjectMemberPermission
from plane.app.serializers import (
    IssueTypeSerializer,
    IssueTypeLiteSerializer,
    ProjectIssueTypeSerializer,
)
from plane.app.views.base import BaseAPIView, BaseViewSet
from plane.db.models import IssueType, ProjectIssueType, Project
from plane.utils.cache import cache_response, invalidate_cache


class ProjectIssueTypesEndpoint(BaseAPIView):
    """
    Endpoint to list all issue types available for a project.
    Returns both workspace-level issue types and project-specific configurations.
    """
    permission_classes = [ProjectEntityPermission]
    use_read_replica = True

    def get(self, request, slug, project_id):
        # Get project-specific issue type configurations
        project_issue_types = ProjectIssueType.objects.filter(
            project_id=project_id,
            project__workspace__slug=slug,
            issue_type__is_active=True,
        ).select_related("issue_type").order_by("level", "issue_type__name")

        if project_issue_types.exists():
            # Return project-specific configurations
            serializer = ProjectIssueTypeSerializer(project_issue_types, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If no project-specific config, return all workspace issue types
        issue_types = IssueType.objects.filter(
            workspace__slug=slug,
            is_active=True,
        ).order_by("level", "name")

        serializer = IssueTypeSerializer(issue_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProjectIssueTypeViewSet(BaseViewSet):
    """
    ViewSet for managing project-specific issue type configurations.
    """
    permission_classes = [ProjectMemberPermission]
    serializer_class = ProjectIssueTypeSerializer
    model = ProjectIssueType

    def get_queryset(self):
        return ProjectIssueType.objects.filter(
            project_id=self.kwargs.get("project_id"),
            project__workspace__slug=self.kwargs.get("slug"),
        ).select_related("issue_type").order_by("level", "issue_type__name")

    def create(self, request, slug, project_id):
        project = Project.objects.get(pk=project_id, workspace__slug=slug)
        issue_type_id = request.data.get("issue_type_id")

        if not issue_type_id:
            return Response(
                {"error": "issue_type_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if issue type exists and belongs to the same workspace
        issue_type = IssueType.objects.filter(
            pk=issue_type_id,
            workspace=project.workspace,
        ).first()

        if not issue_type:
            return Response(
                {"error": "Issue type not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if already exists
        if ProjectIssueType.objects.filter(
            project=project,
            issue_type=issue_type,
        ).exists():
            return Response(
                {"error": "Issue type already added to project"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get max level for ordering
        max_level = ProjectIssueType.objects.filter(
            project=project
        ).order_by("-level").values_list("level", flat=True).first() or 0

        project_issue_type = ProjectIssueType.objects.create(
            project=project,
            issue_type=issue_type,
            level=max_level + 1,
            is_default=request.data.get("is_default", False),
        )

        serializer = ProjectIssueTypeSerializer(project_issue_type)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, slug, project_id, pk):
        project_issue_type = ProjectIssueType.objects.filter(
            pk=pk,
            project_id=project_id,
            project__workspace__slug=slug,
        ).first()

        if not project_issue_type:
            return Response(
                {"error": "Project issue type not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProjectIssueTypeSerializer(
            project_issue_type,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, slug, project_id, pk):
        project_issue_type = ProjectIssueType.objects.filter(
            pk=pk,
            project_id=project_id,
            project__workspace__slug=slug,
        ).first()

        if not project_issue_type:
            return Response(
                {"error": "Project issue type not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if this is the default
        if project_issue_type.is_default:
            return Response(
                {"error": "Cannot remove default issue type from project"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project_issue_type.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
