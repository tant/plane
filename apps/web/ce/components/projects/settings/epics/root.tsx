import { observer } from "mobx-react";
import { Plus, Settings2 } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { ToggleSwitch, Button } from "@plane/ui";
// hooks
import { useProject } from "@/hooks/store/use-project";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
};

export const ProjectEpicsRoot = observer(function ProjectEpicsRoot(props: Props) {
  const { isAdmin } = props;
  const { t } = useTranslation();
  // store hooks
  const { currentProjectDetails } = useProject();

  // For now, epic is always enabled (since we implemented it)
  const isEpicEnabled = true;

  return (
    <div className="space-y-6">
      {/* Epic toggle */}
      <div className="flex items-center justify-between">
        <ToggleSwitch
          value={isEpicEnabled}
          onChange={() => {}}
          disabled={!isAdmin}
          size="sm"
        />
      </div>

      {/* Properties section */}
      {isEpicEnabled && (
        <div className="space-y-4">
          <div
            className="flex items-center gap-3 rounded-lg border border-subtle bg-surface-1 p-4 cursor-pointer hover:bg-surface-2"
          >
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
              <Button
                variant="primary"
                size="sm"
                prependIcon={<Plus className="h-4 w-4" />}
                disabled={!isAdmin}
              >
                {t("project_settings.epics.add_new_property")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
