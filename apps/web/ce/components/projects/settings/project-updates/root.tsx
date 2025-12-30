import { useCallback, useState } from "react";
import { observer } from "mobx-react";
import { FileText } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { ToggleSwitch, Loader } from "@plane/ui";
// hooks
import { useProject } from "@/hooks/store/use-project";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
};

export const ProjectUpdatesRoot = observer(function ProjectUpdatesRoot(props: Props) {
  const { workspaceSlug, projectId, isAdmin } = props;
  const { t } = useTranslation();
  // states
  const [isUpdating, setIsUpdating] = useState(false);
  // store hooks
  const { getProjectById, updateProject } = useProject();

  const currentProjectDetails = getProjectById(projectId);
  const isProjectUpdatesEnabled = currentProjectDetails?.is_project_updates_enabled ?? false;

  const handleToggle = useCallback(async () => {
    if (!currentProjectDetails) return;

    setIsUpdating(true);
    try {
      await updateProject(workspaceSlug, projectId, {
        is_project_updates_enabled: !isProjectUpdatesEnabled,
      });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("toast.success"),
        message: isProjectUpdatesEnabled
          ? t("project_settings.project_updates.disabled")
          : t("project_settings.project_updates.enabled"),
      });
    } catch (error) {
      console.error("Error toggling project updates:", error);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("something_went_wrong"),
      });
    } finally {
      setIsUpdating(false);
    }
  }, [currentProjectDetails, workspaceSlug, projectId, isProjectUpdatesEnabled, updateProject, t]);

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
      {/* Enable card */}
      <div className="flex items-center justify-between rounded-lg border border-subtle bg-surface-1 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-2">
            <FileText className="h-6 w-6 text-tertiary" />
          </div>
          <div>
            <h5 className="text-sm font-medium">{t("project_settings.project_updates.turn_on")}</h5>
            <p className="text-xs text-tertiary">{t("project_settings.project_updates.turn_on_description")}</p>
          </div>
        </div>
        <ToggleSwitch
          value={isProjectUpdatesEnabled}
          onChange={handleToggle}
          disabled={!isAdmin || isUpdating}
          size="sm"
        />
      </div>
    </div>
  );
});
