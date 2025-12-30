"use client";

import { useMemo } from "react";
import { observer } from "mobx-react";
import { TrendingUp, TrendingDown, Minus, Ban } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import type { ICycle, TCycleEstimateType } from "@plane/types";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";

type TActiveCycleBreakdownProps = {
  cycle: ICycle;
};

// State groups that appear on the chart
const CHART_STATE_GROUPS = ["backlog", "unstarted", "started", "completed"];

// Calculate ideal pending based on cycle progress
const calculateIdealPending = (cycle: ICycle, estimateType: TCycleEstimateType): number => {
  if (!cycle.start_date || !cycle.end_date) return 0;

  const startDate = new Date(cycle.start_date);
  const endDate = new Date(cycle.end_date);
  const today = new Date();

  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(1, daysPassed / totalDays);

  const totalItems = estimateType === "points" ? (cycle.total_estimate_points || 0) : (cycle.total_issues || 0);
  const idealCompleted = totalItems * progress;
  const idealPending = Math.round(totalItems - idealCompleted);

  return idealPending;
};

export const ActiveCycleBreakdown = observer(function ActiveCycleBreakdown(props: TActiveCycleBreakdownProps) {
  const { cycle } = props;
  // hooks
  const { t } = useTranslation();
  const { getEstimateTypeByCycleId } = useCycle();

  // derived values
  const estimateType: TCycleEstimateType = getEstimateTypeByCycleId(cycle.id) || "issues";

  // Calculate stats based on estimate type
  const stats = useMemo(() => {
    if (estimateType === "points") {
      return {
        pending: (cycle.backlog_estimate_points || 0) + (cycle.unstarted_estimate_points || 0) + (cycle.started_estimate_points || 0),
        started: cycle.started_estimate_points || 0,
        scope: cycle.total_estimate_points || 0,
        done: cycle.completed_estimate_points || 0,
        unstarted: cycle.unstarted_estimate_points || 0,
        backlog: cycle.backlog_estimate_points || 0,
        cancelled: cycle.cancelled_estimate_points || 0,
      };
    }
    return {
      pending: (cycle.backlog_issues || 0) + (cycle.unstarted_issues || 0) + (cycle.started_issues || 0),
      started: cycle.started_issues || 0,
      scope: cycle.total_issues || 0,
      done: cycle.completed_issues || 0,
      unstarted: cycle.unstarted_issues || 0,
      backlog: cycle.backlog_issues || 0,
      cancelled: cycle.cancelled_issues || 0,
    };
  }, [cycle, estimateType]);

  const idealPending = calculateIdealPending(cycle, estimateType);
  const actualPending = stats.pending;
  const difference = idealPending - actualPending;
  const isLeading = difference > 0;
  const isOnTrack = difference === 0;

  const itemLabel = estimateType === "points" ? "points" : "work items";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-sm font-medium text-secondary">
        Breakdown of this cycle's {itemLabel}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 mt-3">
        {isOnTrack ? (
          <>
            <Minus className="h-4 w-4 text-tertiary" />
            <span className="text-sm text-tertiary">On track</span>
            <span>✅</span>
          </>
        ) : isLeading ? (
          <>
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500">
              Leading by {Math.abs(difference)} {itemLabel}
            </span>
            <span>🏃</span>
          </>
        ) : (
          <>
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-500">
              Lagging by {Math.abs(difference)} {itemLabel}
            </span>
            <span>🐢</span>
          </>
        )}
      </div>

      {/* Stats on chart */}
      <div className="mt-4">
        <div className="text-xs text-tertiary mb-2">{itemLabel} by stategroups on chart</div>
        <div className="space-y-2">
          {/* Today's ideal Pending */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400 border-dashed" style={{ borderStyle: "dashed" }} />
              <span className="text-secondary">Today's ideal Pending</span>
            </div>
            <span className="font-medium">{idealPending}</span>
          </div>
          {/* Pending */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500" />
              <span className="text-secondary">Pending</span>
            </div>
            <span className="font-medium">{actualPending}</span>
          </div>
          {/* Started */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-yellow-500" />
              <span className="text-secondary">Started</span>
            </div>
            <span className="font-medium">{stats.started}</span>
          </div>
          {/* Scope */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500" />
              <span className="text-secondary">Scope</span>
            </div>
            <span className="font-medium">{stats.scope}</span>
          </div>
        </div>
      </div>

      {/* Other stategroups */}
      <div className="mt-4">
        <div className="text-xs text-tertiary mb-2">Other stategroups</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Done</span>
            <span className="font-medium">{stats.done}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Unstarted</span>
            <span className="font-medium">{stats.unstarted}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary">Backlog</span>
            <span className="font-medium">{stats.backlog}</span>
          </div>
        </div>
      </div>

      {/* Excluded cancelled */}
      <div className="flex items-center gap-2 mt-4 text-xs text-tertiary">
        <Ban className="h-3 w-3" />
        <span>Excluded {stats.cancelled} cancelled {itemLabel}</span>
      </div>
    </div>
  );
});
