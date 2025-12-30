"use client";

import { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { useTranslation } from "@plane/i18n";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import type { ICycle } from "@plane/types";
import { ContentWrapper, Loader, Row } from "@plane/ui";
import { cn, getDate, findHowManyDaysLeft } from "@plane/utils";
// components
import { ActiveCycleProgress } from "@/components/cycles/active-cycle/progress";
import { ActiveCycleProductivity } from "@/components/cycles/active-cycle/productivity";
import { CyclesListItem } from "@/components/cycles/list/cycles-list-item";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";
// services
import { CycleService } from "@/services/cycle.service";

const cycleService = new CycleService();

type TWorkspaceActiveCycleItem = {
  workspaceSlug: string;
  cycle: ICycle;
};

const WorkspaceActiveCycleItem = observer(function WorkspaceActiveCycleItem(props: TWorkspaceActiveCycleItem) {
  const { workspaceSlug, cycle } = props;
  // hooks
  const { getProjectById } = useProject();
  const { fetchActiveCycleProgress, fetchActiveCycleAnalytics, getCycleById } = useCycle();
  // derived values
  const project = getProjectById(cycle.project_id);
  const daysLeft = findHowManyDaysLeft(getDate(cycle.end_date));
  const storedCycle = getCycleById(cycle.id);
  const cycleData = storedCycle || cycle;

  // Fetch cycle progress and analytics
  useEffect(() => {
    if (workspaceSlug && cycle.project_id && cycle.id) {
      void fetchActiveCycleProgress(workspaceSlug, cycle.project_id, cycle.id);
      void fetchActiveCycleAnalytics(workspaceSlug, cycle.project_id, cycle.id, "issues");
    }
  }, [workspaceSlug, cycle.project_id, cycle.id, fetchActiveCycleProgress, fetchActiveCycleAnalytics]);

  const handleFiltersUpdate = useCallback(() => {
    // Navigate to cycle with filters - can be enhanced later
  }, []);

  if (!project) return null;

  return (
    <div className="flex flex-col border-b border-subtle">
      <div className="flex items-center gap-3 py-4 px-4">
        <span className="text-2xl">{project.emoji || "📁"}</span>
        <div className="flex flex-col flex-1">
          <span className="text-sm text-tertiary">{project.name}</span>
        </div>
        <span
          className={cn(
            "text-sm font-medium px-2 py-1 rounded",
            daysLeft <= 3 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
          )}
        >
          {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </span>
      </div>
      <CyclesListItem
        key={cycle.id}
        cycleId={cycle.id}
        workspaceSlug={workspaceSlug}
        projectId={cycle.project_id}
        className="!border-b-transparent"
      />
      <Row className="bg-surface-1 pt-3 pb-6">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ActiveCycleProgress
            handleFiltersUpdate={handleFiltersUpdate}
            projectId={cycle.project_id}
            workspaceSlug={workspaceSlug}
            cycle={cycleData}
          />
          <ActiveCycleProductivity workspaceSlug={workspaceSlug} projectId={cycle.project_id} cycle={cycleData} />
        </div>
      </Row>
    </div>
  );
});

export const WorkspaceActiveCyclesRoot = observer(function WorkspaceActiveCyclesRoot() {
  const { t } = useTranslation();
  // states
  const [cursor, setCursor] = useState<string>(`${10}:0:0`);
  // hooks
  const { currentWorkspace } = useWorkspace();
  // derived values
  const workspaceSlug = currentWorkspace?.slug;

  // Fetch workspace active cycles
  const { data, isLoading, error } = useSWR(
    workspaceSlug ? `WORKSPACE_ACTIVE_CYCLES_${workspaceSlug}_${cursor}` : null,
    workspaceSlug ? () => cycleService.workspaceActiveCycles(workspaceSlug, cursor, 10) : null
  );

  const activeCycles = data?.results || [];

  if (isLoading) {
    return (
      <ContentWrapper>
        <Loader className="space-y-4">
          <Loader.Item height="200px" />
          <Loader.Item height="200px" />
          <Loader.Item height="200px" />
        </Loader>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{t("error_loading_active_cycles")}</p>
        </div>
      </ContentWrapper>
    );
  }

  if (!activeCycles || activeCycles.length === 0) {
    return (
      <ContentWrapper>
        <EmptyStateDetailed
          assetKey="cycle"
          title={t("workspace.active_cycles.empty_state.title")}
          description={t("workspace.active_cycles.empty_state.description")}
        />
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <div className="flex flex-col gap-4">
        {activeCycles.map((cycle) => (
          <WorkspaceActiveCycleItem key={cycle.id} workspaceSlug={workspaceSlug!} cycle={cycle} />
        ))}

        {data?.next_page_results && (
          <button
            className="text-sm text-primary-button hover:underline py-4"
            onClick={() => setCursor(data.next_cursor)}
          >
            {t("load_more")}
          </button>
        )}
      </div>
    </ContentWrapper>
  );
});
