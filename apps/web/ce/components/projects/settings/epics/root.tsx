import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import { Plus, Settings2 } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { ToggleSwitch, Loader } from "@plane/ui";
// components
import { EmptyState } from "@/components/common/empty-state";
// hooks
import { useProject } from "@/hooks/store/use-project";
// assets
import EpicsSettingsDark from "@/app/assets/empty-state/epics/settings-dark.webp?url";
import EpicsSettingsLight from "@/app/assets/empty-state/epics/settings-light.webp?url";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
};

export const ProjectEpicsRoot = observer(function ProjectEpicsRoot(props: Props) {
  const { workspaceSlug, projectId, isAdmin } = props;
  const { t } = useTranslation();
  // states
  const [isUpdating, setIsUpdating] = useState(false);
  // store hooks
  const { getProjectById, updateProject } = useProject();
  const { resolvedTheme } = useTheme();

  const currentProjectDetails = getProjectById(projectId);
  const isEpicEnabled = currentProjectDetails?.is_epic_enabled ?? false;

  const handleToggle = useCallback(async () => {
    if (!currentProjectDetails || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateProject(workspaceSlug, projectId, {
        is_epic_enabled: !isEpicEnabled,
      });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("toast.success"),
        message: isEpicEnabled ? t("project_settings.epics.disabled") : t("project_settings.epics.enabled"),
      });
    } catch (error) {
      console.error("Error toggling epics:", error);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("something_went_wrong"),
      });
    } finally {
      setIsUpdating(false);
    }
  }, [currentProjectDetails, workspaceSlug, projectId, isEpicEnabled, updateProject, t, isUpdating]);

  if (!currentProjectDetails) {
    return (
      <div className="space-y-6">
        <Loader>
          <Loader.Item height="100px" width="100%" />
        </Loader>
      </div>
    );
  }

  const emptyStateImage = resolvedTheme === "dark" ? EpicsSettingsDark : EpicsSettingsLight;

  // When epics is enabled
  if (isEpicEnabled) {
    return (
      <div className="space-y-6">
        {/* Header with toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{t("common.epics")}</h3>
            <p className="text-sm text-tertiary">{t("project_settings.epics.description")}</p>
          </div>
          <ToggleSwitch
            value={isEpicEnabled}
            onChange={() => void handleToggle()}
            disabled={!isAdmin || isUpdating}
            size="sm"
          />
        </div>

        {/* Properties section */}
        <div className="space-y-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-subtle bg-surface-1 p-4 text-left hover:bg-surface-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2">
              <Settings2 className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <span className="text-sm font-medium">{t("project_settings.epics.properties")}</span>
              <p className="text-xs text-tertiary">{t("project_settings.epics.properties_description")}</p>
            </div>
          </button>

          {/* Empty state for custom properties */}
          <div className="ml-14 rounded-lg border border-dashed border-subtle p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Settings2 className="h-8 w-8 text-tertiary" />
              <div>
                <p className="text-sm font-medium">{t("project_settings.epics.add_custom_properties")}</p>
                <p className="text-xs text-tertiary">{t("project_settings.epics.custom_properties_empty")}</p>
              </div>
              <Button variant="primary" size="sm" prependIcon={<Plus className="h-4 w-4" />} disabled={!isAdmin}>
                {t("project_settings.epics.add_new_property")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state when epics is not enabled
  return (
    <div className="space-y-6">
      {/* Header with Enable button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{t("common.epics")}</h3>
          <p className="text-sm text-tertiary">{t("project_settings.epics.description")}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => void handleToggle()}
          disabled={!isAdmin || isUpdating}
          loading={isUpdating}
        >
          {t("common.enable")}
        </Button>
      </div>

      {/* Empty state */}
      <EmptyState
        title={t("project_settings.epics.enable_title")}
        description={t("project_settings.epics.enable_description")}
        image={emptyStateImage}
        primaryButton={{
          text: t("common.enable"),
          onClick: () => void handleToggle(),
        }}
        disabled={!isAdmin || isUpdating}
      />
    </div>
  );
});
