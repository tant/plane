import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import { Plus, Settings2 } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { ToggleSwitch, Button, Loader } from "@plane/ui";
// hooks
import { useProject } from "@/hooks/store/use-project";

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

  const currentProjectDetails = getProjectById(projectId);
  const isEpicEnabled = currentProjectDetails?.is_epic_enabled ?? false;

  const handleToggle = useCallback(async () => {
    if (!currentProjectDetails) return;

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
  }, [currentProjectDetails, workspaceSlug, projectId, isEpicEnabled, updateProject, t]);

  if (!currentProjectDetails) {
    return (
      <div className="space-y-6">
        <Loader>
          <Loader.Item height="100px" width="100%" />
        </Loader>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Epic enable card */}
      <div className="flex items-center justify-between rounded-lg border border-subtle bg-surface-1 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-2">
            <Settings2 className="h-6 w-6 text-tertiary" />
          </div>
          <div>
            <h5 className="text-sm font-medium">{t("project_settings.epics.turn_on")}</h5>
            <p className="text-xs text-tertiary">{t("project_settings.epics.turn_on_description")}</p>
          </div>
        </div>
        <ToggleSwitch value={isEpicEnabled} onChange={handleToggle} disabled={!isAdmin || isUpdating} size="sm" />
      </div>

      {/* Properties section - only show when enabled */}
      {isEpicEnabled && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-subtle bg-surface-1 p-4 cursor-pointer hover:bg-surface-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2">
              <Settings2 className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <span className="text-sm font-medium">{t("project_settings.epics.properties")}</span>
              <p className="text-xs text-tertiary">{t("project_settings.epics.properties_description")}</p>
            </div>
          </div>

          {/* Empty state for custom properties */}
          <div className="ml-12 rounded-lg border border-dashed border-subtle p-6">
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
      )}
    </div>
  );
});
