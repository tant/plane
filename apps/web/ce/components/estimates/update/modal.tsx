"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { ArrowRight } from "lucide-react";
// plane imports
import { EEstimateSystem, ESTIMATE_SYSTEMS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { ChevronLeftIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { TEstimatePointsObject, TEstimateSystemKeys, TEstimateTypeError } from "@plane/types";
import { EModalPosition, EModalWidth, ModalCore, CustomSelect } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useEstimate } from "@/hooks/store/estimates/use-estimate";
import { useProjectEstimates } from "@/hooks/store/estimates";
// local imports
import { EstimatePointCreateRoot } from "@/components/estimates/points";
// plane web imports
import { isEstimateSystemEnabled } from "@/plane-web/components/estimates/helper";

type TUpdateEstimateModal = {
  workspaceSlug: string;
  projectId: string;
  estimateId: string | undefined;
  isOpen: boolean;
  handleClose: () => void;
};

type TUpdateStage = "select" | "edit" | "switch";

export const UpdateEstimateModal = observer(function UpdateEstimateModal(props: TUpdateEstimateModal) {
  const { workspaceSlug, projectId, estimateId, isOpen, handleClose } = props;
  // hooks
  const { t } = useTranslation();
  const { estimateById } = useProjectEstimates();
  const { estimatePointIds, estimatePointById } = useEstimate(estimateId);
  // states
  const [stage, setStage] = useState<TUpdateStage>("select");
  const [estimatePoints, setEstimatePoints] = useState<TEstimatePointsObject[] | undefined>(undefined);
  const [estimatePointError, setEstimatePointError] = useState<TEstimateTypeError>(undefined);
  const [newEstimateType, setNewEstimateType] = useState<TEstimateSystemKeys | undefined>(undefined);
  const [buttonLoader, setButtonLoader] = useState(false);

  // derived values
  const currentEstimate = estimateById(estimateId || "");
  const currentEstimateType = currentEstimate?.type as TEstimateSystemKeys;

  // Initialize estimate points from store
  useEffect(() => {
    if (isOpen && estimatePointIds && estimatePointIds.length > 0) {
      const points: TEstimatePointsObject[] = [];
      estimatePointIds.forEach((id, index) => {
        const point = estimatePointById(id);
        if (point) {
          points.push({
            id: point.id,
            key: index + 1,
            value: point.value || "",
          });
        }
      });
      setEstimatePoints(points);
    }
  }, [isOpen, estimatePointIds, estimatePointById]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStage("select");
      setNewEstimateType(undefined);
      setEstimatePointError(undefined);
      setButtonLoader(false);
    }
  }, [isOpen]);

  const handleEstimatePointError = (
    key: number,
    oldValue: string,
    newValue: string,
    message: string | undefined,
    mode: "add" | "delete" = "add"
  ) => {
    setEstimatePointError((prev) => {
      if (mode === "add") {
        return { ...prev, [key]: { oldValue, newValue, message } };
      } else {
        const newError = { ...prev };
        delete newError[key];
        return newError;
      }
    });
  };

  const handleDone = () => {
    // Close modal after editing
    handleClose();
  };

  const handleSwitchEstimateType = async () => {
    if (!workspaceSlug || !projectId || !estimateId || !newEstimateType) return;

    try {
      setButtonLoader(true);
      // Note: This would require an API endpoint to switch estimate types
      // For now, show a toast that this feature is not available in CE
      setToast({
        type: TOAST_TYPE.INFO,
        title: t("common.info"),
        message: "Switching estimate types is not available in the community edition.",
      });
      setButtonLoader(false);
      handleClose();
    } catch {
      setButtonLoader(false);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("project_settings.estimates.toasts.updated.error.title"),
        message: t("project_settings.estimates.toasts.updated.error.message"),
      });
    }
  };

  // Available estimate types for switching (exclude current type)
  const availableEstimateTypes = useMemo(() => {
    return Object.keys(ESTIMATE_SYSTEMS)
      .filter((key) => {
        const systemKey = key as TEstimateSystemKeys;
        return systemKey !== currentEstimateType && isEstimateSystemEnabled(systemKey);
      })
      .map((key) => key as TEstimateSystemKeys);
  }, [currentEstimateType]);

  const renderStageSelect = () => (
    <div className="relative space-y-6 py-5">
      {/* Header */}
      <div className="px-5">
        <div className="text-lg font-medium text-primary">
          {t("project_settings.estimates.edit.title")}
        </div>
      </div>

      {/* Options */}
      <div className="px-5 space-y-3">
        {/* Option 1: Add, update or remove estimates */}
        <div
          className="border border-subtle rounded-md p-4 cursor-pointer hover:bg-layer-transparent-hover transition-colors"
          onClick={() => setStage("edit")}
        >
          <h3 className="text-sm font-medium text-primary">
            {t("project_settings.estimates.edit.add_update_remove.title")}
          </h3>
          <p className="text-xs text-tertiary mt-1">
            {t("project_settings.estimates.edit.add_update_remove.description")}
          </p>
        </div>

        {/* Option 2: Change estimate type */}
        <div
          className="border border-subtle rounded-md p-4 cursor-pointer hover:bg-layer-transparent-hover transition-colors"
          onClick={() => setStage("switch")}
        >
          <h3 className="text-sm font-medium text-primary">
            {t("project_settings.estimates.edit.change_type.title")}
          </h3>
          <p className="text-xs text-tertiary mt-1">
            {t("project_settings.estimates.edit.change_type.description")}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pt-5 border-t border-subtle">
        <Button variant="secondary" size="lg" onClick={handleClose}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );

  const renderStageEdit = () => (
    <div className="relative space-y-6 py-5">
      {/* Header */}
      <div className="relative flex justify-between items-center gap-2 px-5">
        <div className="relative flex items-center gap-1">
          <div
            onClick={() => setStage("select")}
            className="flex-shrink-0 cursor-pointer w-5 h-5 flex justify-center items-center"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </div>
          <div className="text-lg font-medium text-primary">
            {t("project_settings.estimates.edit.title")}
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={handleDone}>
          {t("common.done")}
        </Button>
      </div>

      {/* Estimate Points List */}
      <div className="px-5">
        {estimatePoints && currentEstimateType && (
          <EstimatePointCreateRoot
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            estimateId={estimateId}
            estimateType={currentEstimateType}
            estimatePoints={estimatePoints}
            setEstimatePoints={setEstimatePoints}
            estimatePointError={estimatePointError}
            handleEstimatePointError={handleEstimatePointError}
          />
        )}
      </div>
    </div>
  );

  const renderStageSwitch = () => (
    <div className="relative space-y-6 py-5">
      {/* Header */}
      <div className="relative flex items-center gap-1 px-5">
        <div
          onClick={() => setStage("select")}
          className="flex-shrink-0 cursor-pointer w-5 h-5 flex justify-center items-center"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </div>
        <div className="text-lg font-medium text-primary">
          {t("project_settings.estimates.edit.switch.title")}
        </div>
      </div>

      {/* Switch content */}
      <div className="px-5 space-y-3">
        {/* Labels */}
        <div className="flex items-center gap-4">
          <div className="flex-1 text-xs text-tertiary">
            {t("project_settings.estimates.edit.switch.current")}
          </div>
          <div className="w-8" />
          <div className="flex-1 text-xs text-tertiary">
            {t("project_settings.estimates.edit.switch.new")}
          </div>
        </div>

        {/* Current and New estimate type */}
        <div className="flex items-center gap-4">
          {/* Current type */}
          <div className="flex-1 px-3 py-2 bg-layer-1 rounded-md text-sm font-medium capitalize">
            {currentEstimateType}
          </div>

          {/* Arrow */}
          <div className="w-8 flex justify-center">
            <ArrowRight className="w-4 h-4 text-tertiary" />
          </div>

          {/* New type dropdown */}
          <div className="flex-1">
            <CustomSelect
              value={newEstimateType}
              onChange={(value: TEstimateSystemKeys) => setNewEstimateType(value)}
              label={
                <span className={cn("capitalize", !newEstimateType && "text-tertiary")}>
                  {newEstimateType || t("project_settings.estimates.edit.switch.select_placeholder")}
                </span>
              }
              buttonClassName="w-full"
            >
              {availableEstimateTypes.map((type) => (
                <CustomSelect.Option key={type} value={type}>
                  <span className="capitalize">{type}</span>
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex justify-end items-center gap-3 px-5 pt-5 border-t border-subtle">
        <Button variant="secondary" size="lg" onClick={handleClose} disabled={buttonLoader}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSwitchEstimateType}
          disabled={!newEstimateType || buttonLoader}
        >
          {buttonLoader ? t("common.updating") : t("common.update")}
        </Button>
      </div>
    </div>
  );

  return (
    <ModalCore isOpen={isOpen} position={EModalPosition.TOP} width={EModalWidth.XXL}>
      {stage === "select" && renderStageSelect()}
      {stage === "edit" && renderStageEdit()}
      {stage === "switch" && renderStageSwitch()}
    </ModalCore>
  );
});
