"use client";

import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useProject } from "@/hooks/store/use-project";
// plane web components
import { ProjectOverviewRoot } from "@/plane-web/components/projects/overview";

const ProjectOverviewPage = observer(function ProjectOverviewPage() {
  const { workspaceSlug, projectId } = useParams<{ workspaceSlug: string; projectId: string }>();
  // store hooks
  const { currentProjectDetails } = useProject();
  // derived values
  const pageTitle = currentProjectDetails?.name ? `${currentProjectDetails?.name} - Home` : undefined;

  if (!workspaceSlug || !projectId) return null;

  return (
    <>
      <PageHead title={pageTitle} />
      <ProjectOverviewRoot workspaceSlug={workspaceSlug} projectId={projectId} />
    </>
  );
});

export default ProjectOverviewPage;
