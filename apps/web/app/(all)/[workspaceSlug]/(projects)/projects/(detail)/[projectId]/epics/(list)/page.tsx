import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// components
import { PageHead } from "@/components/core/page-title";
// hooks
import { useProject } from "@/hooks/store/use-project";
// plane web
import { ProjectEpicLayoutRoot } from "@/plane-web/components/epics/epic-layouts/roots/project-epic-layout-root";

function ProjectEpicsPage() {
  const { projectId } = useParams();
  // store
  const { getProjectById } = useProject();

  // derived values
  const project = getProjectById(projectId?.toString() ?? "");
  const pageTitle = project?.name ? `${project?.name} - Epics` : undefined;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="h-full w-full">
        <ProjectEpicLayoutRoot />
      </div>
    </>
  );
}

export default observer(ProjectEpicsPage);
