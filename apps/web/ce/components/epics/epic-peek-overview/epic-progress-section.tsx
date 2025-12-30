"use client";

import type { FC } from "react";
import { observer } from "mobx-react";
import { ChevronRight } from "lucide-react";
// plane imports
import { StateGroupIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import type { TStateGroups } from "@plane/types";
import { EIssueServiceType } from "@plane/types";
import { cn } from "@plane/utils";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProjectState } from "@/hooks/store/use-project-state";

type TEpicProgressSectionProps = {
  workspaceSlug: string;
  projectId: string;
  epicId: string;
};

type TStateGroupData = {
  group: TStateGroups;
  count: number;
  percentage: number;
};

const STATE_GROUP_ORDER: TStateGroups[] = ["backlog", "unstarted", "started", "completed", "cancelled"];

const STATE_GROUP_LABELS: Record<TStateGroups, string> = {
  backlog: "Backlog",
  unstarted: "Unstarted",
  started: "Started",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATE_GROUP_COLORS: Record<TStateGroups, string> = {
  backlog: "bg-custom-background-80",
  unstarted: "bg-blue-500",
  started: "bg-amber-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export const EpicProgressSection: FC<TEpicProgressSectionProps> = observer((props) => {
  const { epicId } = props;

  // store hooks
  const {
    issue: { getIssueById },
    subIssues: { subIssuesByIssueId },
  } = useIssueDetail(EIssueServiceType.EPICS);
  const { getStateById } = useProjectState();

  // derived values
  const subIssueIds = subIssuesByIssueId(epicId) || [];

  // Calculate state group distribution
  const stateGroupData: TStateGroupData[] = (() => {
    const groupCounts: Record<TStateGroups, number> = {
      backlog: 0,
      unstarted: 0,
      started: 0,
      completed: 0,
      cancelled: 0,
    };

    subIssueIds.forEach((issueId) => {
      const issue = getIssueById(issueId);
      if (issue?.state_id) {
        const state = getStateById(issue.state_id);
        if (state?.group) {
          groupCounts[state.group]++;
        }
      }
    });

    const total = subIssueIds.length || 1;

    return STATE_GROUP_ORDER.map((group) => ({
      group,
      count: groupCounts[group],
      percentage: subIssueIds.length > 0 ? Math.round((groupCounts[group] / total) * 100) : 0,
    }));
  })();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-custom-text-100">Progress</h3>
        <Tooltip tooltipContent="View details">
          <button className="text-custom-text-300 hover:text-custom-text-200">
            <ChevronRight className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      {/* Progress bar */}
      {subIssueIds.length > 0 ? (
        <div className="h-2 w-full rounded-full bg-custom-background-80 overflow-hidden flex">
          {stateGroupData.map((data) =>
            data.count > 0 ? (
              <Tooltip
                key={data.group}
                tooltipContent={`${STATE_GROUP_LABELS[data.group]}: ${data.count} (${data.percentage}%)`}
              >
                <div
                  className={cn("h-full transition-all", STATE_GROUP_COLORS[data.group])}
                  style={{ width: `${data.percentage}%` }}
                />
              </Tooltip>
            ) : null
          )}
        </div>
      ) : (
        <div className="h-2 w-full rounded-full bg-custom-background-80" />
      )}

      {/* State group breakdown */}
      <div className="space-y-2">
        {stateGroupData.map((data) => (
          <div key={data.group} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <StateGroupIcon stateGroup={data.group} />
              <span className="text-custom-text-200">{STATE_GROUP_LABELS[data.group]}</span>
            </div>
            <div className="flex items-center gap-3 text-custom-text-300">
              <span className="w-6 text-right">{data.count}</span>
              <span className="w-10 text-right">{data.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
