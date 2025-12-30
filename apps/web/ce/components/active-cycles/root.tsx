"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { observer } from "mobx-react";
import useSWR from "swr";
// plane imports
import { ExternalLink } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { CycleIcon } from "@plane/propel/icons";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import type { ICycle } from "@plane/types";
import { ContentWrapper, Loader, Tooltip, Row } from "@plane/ui";
import { cn, getDate, findHowManyDaysLeft } from "@plane/utils";
// local components
import { ActiveCycleBurndown } from "./burndown";
import { ActiveCycleBreakdown } from "./breakdown";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";
// services
import { CycleService } from "@/services/cycle.service";

const cycleService = new CycleService();

type TWorkspaceActiveCycleItemProps = {
  workspaceSlug: string;
  cycle: ICycle;
};

const WorkspaceActiveCycleItem = observer(function WorkspaceActiveCycleItem(props: TWorkspaceActiveCycleItemProps) {
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

  if (!project) return null;

  return (
    <div className="flex flex-col">
      {/* Project header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Logo logo={project.logo_props} size={20} />
        <h2 className="text-base font-medium text-secondary">{project.name}</h2>
      </div>

      {/* Cycle info row */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-subtle">
        <div className="flex items-center gap-3">
          <CycleIcon className="h-4 w-4 text-tertiary" />
          <h3 className="text-sm font-medium text-secondary">{cycleData.name}</h3>
          {daysLeft !== undefined && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                daysLeft <= 3 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
              )}
            >
              {daysLeft} {daysLeft === 1 ? "day" : "days"} left
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Tooltip tooltipContent="Assignee">
            <div className="h-5 w-5 rounded-full bg-surface-2 flex items-center justify-center text-xs text-tertiary">
              ?
            </div>
          </Tooltip>
          <Link
            href={`/${workspaceSlug}/projects/${cycle.project_id}/cycles/${cycle.id}/`}
            className="flex items-center gap-1 text-sm text-primary-button hover:underline"
          >
            View cycle
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Analytics section - 2 columns */}
      <Row className="bg-surface-1 border-t border-subtle">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left column - Burndown chart */}
          <div className="min-h-[280px]">
            <ActiveCycleBurndown workspaceSlug={workspaceSlug} projectId={cycle.project_id} cycle={cycleData} />
          </div>

          {/* Right column - Breakdown */}
          <div className="min-h-[280px]">
            <ActiveCycleBreakdown cycle={cycleData} />
          </div>
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
          <Loader.Item height="300px" />
          <Loader.Item height="300px" />
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
      <div className="flex flex-col divide-y divide-subtle border border-subtle rounded-lg overflow-hidden">
        {activeCycles.map((cycle) => (
          <WorkspaceActiveCycleItem key={cycle.id} workspaceSlug={workspaceSlug!} cycle={cycle} />
        ))}
      </div>

      {data?.next_page_results && (
        <button
          className="w-full text-sm text-primary-button hover:underline py-4 mt-4"
          onClick={() => setCursor(data.next_cursor)}
        >
          {t("load_more")}
        </button>
      )}
    </ContentWrapper>
  );
});
