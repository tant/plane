# Django imports
from django.db.models import Q

# Third Party imports
from rest_framework.response import Response
from rest_framework import status

# Module imports
from plane.app.views.base import BaseAPIView
from plane.app.serializers import IssueActivitySerializer
from plane.app.permissions import ProjectEntityPermission, allow_permission, ROLE
from plane.db.models import IssueActivity


class ProjectActivityEndpoint(BaseAPIView):
    """
    Endpoint to get all issue activities within a project.
    This provides a project-level view of all work item activities.
    """

    permission_classes = [ProjectEntityPermission]
    use_read_replica = True

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def get(self, request, slug, project_id):
        # Get activities for all issues in this project
        issue_activities = (
            IssueActivity.objects.filter(project_id=project_id)
            .filter(
                ~Q(field__in=["comment", "vote", "reaction", "draft"]),
                project__project_projectmember__member=self.request.user,
                project__project_projectmember__is_active=True,
                project__archived_at__isnull=True,
                workspace__slug=slug,
            )
            .select_related("actor", "workspace", "issue", "project")
            .order_by("-created_at")
        )

        return self.paginate(
            order_by=request.GET.get("order_by", "-created_at"),
            request=request,
            queryset=issue_activities,
            on_results=lambda activities: IssueActivitySerializer(activities, many=True).data,
        )
