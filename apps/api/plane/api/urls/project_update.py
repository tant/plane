from django.urls import path

from plane.api.views import (
    ProjectUpdateListCreateAPIEndpoint,
    ProjectUpdateDetailAPIEndpoint,
)

urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/updates/",
        ProjectUpdateListCreateAPIEndpoint.as_view(http_method_names=["get", "post"]),
        name="project-updates",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/updates/<uuid:pk>/",
        ProjectUpdateDetailAPIEndpoint.as_view(http_method_names=["get", "patch", "delete"]),
        name="project-update-detail",
    ),
]
