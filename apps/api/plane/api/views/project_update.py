# Python imports

# Django imports
from django.db.models import Q

# Third party imports
from rest_framework import status
from rest_framework.response import Response

# Module imports
from plane.db.models import ProjectUpdate, Project
from .base import BaseAPIView
from plane.api.serializers import ProjectUpdateSerializer, ProjectUpdateCreateSerializer
from plane.app.permissions import ProjectBasePermission


class ProjectUpdateListCreateAPIEndpoint(BaseAPIView):
    """Project Update List and Create Endpoint"""

    serializer_class = ProjectUpdateSerializer
    model = ProjectUpdate
    permission_classes = [ProjectBasePermission]

    def get_queryset(self):
        return ProjectUpdate.objects.filter(
            workspace__slug=self.kwargs.get("slug"),
            project_id=self.kwargs.get("project_id"),
        ).select_related("created_by")

    def get(self, request, slug, project_id):
        """
        List all project updates for a project
        """
        # Check if project updates is enabled for this project
        project = Project.objects.filter(
            workspace__slug=slug,
            pk=project_id,
        ).first()

        if not project:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get query parameters
        category = request.query_params.get("category", None)

        queryset = self.get_queryset()

        if category:
            queryset = queryset.filter(category=category)

        # Order by created_at descending (newest first)
        queryset = queryset.order_by("-created_at")

        serializer = ProjectUpdateSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, slug, project_id):
        """
        Create a new project update
        """
        # Check if project exists and updates are enabled
        project = Project.objects.filter(
            workspace__slug=slug,
            pk=project_id,
        ).first()

        if not project:
            return Response(
                {"error": "Project not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not project.is_project_updates_enabled:
            return Response(
                {"error": "Project updates is not enabled for this project"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProjectUpdateCreateSerializer(
            data=request.data,
            context={
                "request": request,
                "project_id": project_id,
                "workspace_id": project.workspace_id,
            },
        )

        if serializer.is_valid():
            serializer.save()
            # Return full serializer data
            project_update = ProjectUpdate.objects.select_related("created_by").get(
                pk=serializer.instance.pk
            )
            return Response(
                ProjectUpdateSerializer(project_update).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectUpdateDetailAPIEndpoint(BaseAPIView):
    """Project Update Detail Endpoint"""

    serializer_class = ProjectUpdateSerializer
    model = ProjectUpdate
    permission_classes = [ProjectBasePermission]

    def get_queryset(self):
        return ProjectUpdate.objects.filter(
            workspace__slug=self.kwargs.get("slug"),
            project_id=self.kwargs.get("project_id"),
        ).select_related("created_by")

    def get(self, request, slug, project_id, pk):
        """
        Get a single project update
        """
        project_update = self.get_queryset().filter(pk=pk).first()

        if not project_update:
            return Response(
                {"error": "Project update not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProjectUpdateSerializer(project_update)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, slug, project_id, pk):
        """
        Update a project update
        """
        project_update = self.get_queryset().filter(pk=pk).first()

        if not project_update:
            return Response(
                {"error": "Project update not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the creator can update
        if project_update.created_by != request.user:
            return Response(
                {"error": "You do not have permission to update this update"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ProjectUpdateCreateSerializer(
            project_update,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()
            # Return full serializer data
            project_update = ProjectUpdate.objects.select_related("created_by").get(
                pk=serializer.instance.pk
            )
            return Response(
                ProjectUpdateSerializer(project_update).data,
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, project_id, pk):
        """
        Delete a project update
        """
        project_update = self.get_queryset().filter(pk=pk).first()

        if not project_update:
            return Response(
                {"error": "Project update not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the creator can delete
        if project_update.created_by != request.user:
            return Response(
                {"error": "You do not have permission to delete this update"},
                status=status.HTTP_403_FORBIDDEN,
            )

        project_update.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
