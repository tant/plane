import { useCallback } from "react";
// plane imports
import { EUserPermissions } from "@plane/constants";
import { EpicIcon, OverviewIcon } from "@plane/propel/icons";
// components
import type { TNavigationItem } from "@/components/workspace/sidebar/project-navigation";
import { ProjectNavigation } from "@/components/workspace/sidebar/project-navigation";

type TProjectItemsRootProps = {
  workspaceSlug: string;
  projectId: string;
};

export function ProjectNavigationRoot(props: TProjectItemsRootProps) {
  const { workspaceSlug, projectId } = props;

  const additionalNavigationItems = useCallback(
    (workspaceSlug: string, projectId: string): TNavigationItem[] => [
      {
        i18n_key: "sidebar.overview",
        key: "overview",
        name: "Overview",
        href: `/${workspaceSlug}/projects/${projectId}/overview`,
        icon: OverviewIcon,
        access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
        shouldRender: true,
        sortOrder: 0.5, // Before work items
      },
      {
        i18n_key: "sidebar.epics",
        key: "epics",
        name: "Epics",
        href: `/${workspaceSlug}/projects/${projectId}/epics`,
        icon: EpicIcon,
        access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
        shouldRender: true,
        sortOrder: 0.75, // After overview, before work items
      },
    ],
    []
  );

  return (
    <ProjectNavigation
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      additionalNavigationItems={additionalNavigationItems}
    />
  );
}
