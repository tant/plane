"use client";

import { Fragment } from "react";
import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { ChevronDownIcon } from "@plane/propel/icons";
import type { ICycle, TCyclePlotType, TCycleEstimateType } from "@plane/types";
import { CustomSelect, Loader } from "@plane/ui";
import { getDate, renderFormattedDateWithoutYear } from "@plane/utils";
// components
import ProgressChart from "@/components/core/sidebar/progress-chart";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";

// Options for chart type dropdown
const chartTypeOptions = [
  { value: "burndown", label: "Burn-down" },
  { value: "burnup", label: "Burn-up" },
];

// Options for estimate type dropdown
const estimateTypeOptions = [
  { value: "issues", label: "Work items" },
  { value: "points", label: "Estimates" },
];

type TActiveCycleBurndownProps = {
  workspaceSlug: string;
  projectId: string;
  cycle: ICycle;
};

export const ActiveCycleBurndown = observer(function ActiveCycleBurndown(props: TActiveCycleBurndownProps) {
  const { workspaceSlug, projectId, cycle } = props;
  // hooks
  const { t } = useTranslation();
  const { getPlotTypeByCycleId, getEstimateTypeByCycleId, setPlotType, setEstimateType, fetchCycleDetails } =
    useCycle();

  // derived values
  const plotType: TCyclePlotType = getPlotTypeByCycleId(cycle.id) || "burndown";
  const estimateType: TCycleEstimateType = getEstimateTypeByCycleId(cycle.id) || "issues";
  const cycleStartDate = getDate(cycle.start_date);
  const cycleEndDate = getDate(cycle.end_date);
  const totalIssues = cycle.total_issues || 0;
  const totalEstimatePoints = cycle.total_estimate_points || 0;

  const chartDistributionData =
    estimateType === "points" ? cycle.estimate_distribution : cycle.distribution || undefined;
  const completionChartDistributionData = chartDistributionData?.completion_chart || undefined;

  // handlers
  const handlePlotTypeChange = (value: TCyclePlotType) => {
    setPlotType(cycle.id, value);
  };

  const handleEstimateTypeChange = async (value: TCycleEstimateType) => {
    setEstimateType(cycle.id, value);
    if (workspaceSlug && projectId && cycle.id) {
      try {
        await fetchCycleDetails(workspaceSlug, projectId, cycle.id);
      } catch (err) {
        console.error(err);
        setEstimateType(cycle.id, estimateType);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with dropdowns */}
      <div className="flex items-center gap-1.5 text-sm">
        <CustomSelect
          value={plotType}
          label={
            <span className="flex items-center gap-1">
              {chartTypeOptions.find((v) => v.value === plotType)?.label}
              <ChevronDownIcon className="h-3 w-3" />
            </span>
          }
          onChange={handlePlotTypeChange}
          buttonClassName="bg-transparent border-none text-sm font-medium text-secondary p-0"
        >
          {chartTypeOptions.map((item) => (
            <CustomSelect.Option key={item.value} value={item.value}>
              {item.label}
            </CustomSelect.Option>
          ))}
        </CustomSelect>
        <span className="text-tertiary">for</span>
        <CustomSelect
          value={estimateType}
          label={<span>{estimateTypeOptions.find((v) => v.value === estimateType)?.label}</span>}
          onChange={handleEstimateTypeChange}
          buttonClassName="bg-transparent border-none text-sm font-medium text-secondary p-0"
        >
          {estimateTypeOptions.map((item) => (
            <CustomSelect.Option key={item.value} value={item.value}>
              {item.label}
            </CustomSelect.Option>
          ))}
        </CustomSelect>
      </div>

      {/* Chart */}
      <div className="flex-1 mt-4">
        {cycleStartDate && cycleEndDate && completionChartDistributionData ? (
          <Fragment>
            {/* Date range header */}
            <div className="flex justify-between mb-2 text-xs text-tertiary">
              <div className="flex flex-col items-start">
                <span className="font-medium text-secondary">
                  {renderFormattedDateWithoutYear(cycle.start_date || "")}
                </span>
                <span>Start</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-secondary">
                  {renderFormattedDateWithoutYear(cycle.end_date || "")}
                </span>
                <span>End</span>
              </div>
            </div>
            {/* Progress Chart */}
            <ProgressChart
              distribution={completionChartDistributionData}
              totalIssues={estimateType === "points" ? totalEstimatePoints : totalIssues}
              plotTitle={estimateType === "points" ? t("points") : t("work_items")}
              className="h-[200px]"
            />
          </Fragment>
        ) : (
          <Loader className="w-full h-[200px]">
            <Loader.Item width="100%" height="100%" />
          </Loader>
        )}
      </div>
    </div>
  );
});
