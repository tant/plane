# Python imports
from enum import Enum

# Django imports
from django.conf import settings
from django.db import models

# Module imports
from .project import ProjectBaseModel


class ProjectUpdateCategory(Enum):
    PROGRESS = "progress"
    MILESTONE = "milestone"
    BLOCKER = "blocker"
    GENERAL = "general"

    @classmethod
    def choices(cls):
        return [
            ("progress", "Progress"),
            ("milestone", "Milestone"),
            ("blocker", "Blocker"),
            ("general", "General"),
        ]


class ProjectUpdate(ProjectBaseModel):
    """Model to store project status updates/changelogs"""

    CATEGORY_CHOICES = ProjectUpdateCategory.choices()

    title = models.CharField(max_length=255, verbose_name="Update Title")
    description = models.TextField(verbose_name="Update Description", blank=True)
    description_html = models.TextField(verbose_name="Update Description HTML", blank=True, null=True)
    description_stripped = models.TextField(verbose_name="Update Description Stripped", blank=True, null=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="general",
        verbose_name="Update Category",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_updates",
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "Project Update"
        verbose_name_plural = "Project Updates"
        db_table = "project_updates"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.title} - {self.project.name}"
