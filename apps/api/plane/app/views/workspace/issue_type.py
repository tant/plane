# Third party modules
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.app.permissions import WorkspaceEntityPermission, WorkspaceUserPermission
from plane.app.serializers import IssueTypeSerializer, IssueTypeLiteSerializer
from plane.app.views.base import BaseAPIView, BaseViewSet
from plane.db.models import IssueType, Workspace
from plane.utils.cache import cache_response, invalidate_cache


class WorkspaceIssueTypesEndpoint(BaseAPIView):
    """
    Endpoint to list all issue types in a workspace.
    """
    permission_classes = [WorkspaceEntityPermission]
    use_read_replica = True

    @cache_response(60 * 60 * 2)
    def get(self, request, slug):
        issue_types = IssueType.objects.filter(
            workspace__slug=slug,
            is_active=True,
        ).order_by("level", "name")

        serializer = IssueTypeSerializer(issue_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class WorkspaceIssueTypeViewSet(BaseViewSet):
    """
    ViewSet for CRUD operations on IssueType.
    """
    permission_classes = [WorkspaceUserPermission]
    serializer_class = IssueTypeSerializer
    model = IssueType

    def get_queryset(self):
        return IssueType.objects.filter(
            workspace__slug=self.kwargs.get("slug")
        ).order_by("level", "name")

    @invalidate_cache(path="/api/workspaces/:slug/issue-types/", url_params=True, user=False)
    def create(self, request, slug):
        workspace = Workspace.objects.get(slug=slug)

        # Get the max level for ordering
        max_level = IssueType.objects.filter(workspace=workspace).order_by("-level").values_list("level", flat=True).first() or 0

        serializer = IssueTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                workspace=workspace,
                level=max_level + 1,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, slug, pk):
        issue_type = IssueType.objects.filter(
            workspace__slug=slug,
            pk=pk,
        ).first()

        if not issue_type:
            return Response(
                {"error": "Issue type not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = IssueTypeSerializer(issue_type)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @invalidate_cache(path="/api/workspaces/:slug/issue-types/", url_params=True, user=False)
    def partial_update(self, request, slug, pk):
        issue_type = IssueType.objects.filter(
            workspace__slug=slug,
            pk=pk,
        ).first()

        if not issue_type:
            return Response(
                {"error": "Issue type not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = IssueTypeSerializer(issue_type, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @invalidate_cache(path="/api/workspaces/:slug/issue-types/", url_params=True, user=False)
    def destroy(self, request, slug, pk):
        issue_type = IssueType.objects.filter(
            workspace__slug=slug,
            pk=pk,
        ).first()

        if not issue_type:
            return Response(
                {"error": "Issue type not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if this is the default issue type
        if issue_type.is_default:
            return Response(
                {"error": "Cannot delete default issue type"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        issue_type.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
