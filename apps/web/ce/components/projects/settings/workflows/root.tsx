import { observer } from "mobx-react";
import { useTranslation } from "@plane/i18n";
import { ToggleSwitch } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useProjectState } from "@/hooks/store/use-project-state";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
};

export const ProjectWorkflowsRoot = observer(function ProjectWorkflowsRoot(props: Props) {
  const { projectId, isAdmin } = props;
  const { t } = useTranslation();
  // store hooks
  const { projectStates } = useProjectState();

  // Get states for this project
  const states = projectStates ?? [];

  return (
    <div className="space-y-6">
      {/* Live toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Live</span>
          <ToggleSwitch value={false} onChange={() => {}} disabled={!isAdmin} size="sm" />
        </div>
      </div>

      {/* States list */}
      <div className="space-y-4">
        {states.map((state) => (
          <div key={state.id} className="rounded-lg border border-subtle bg-surface-1 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: state.color }}
                />
                <h6 className="text-sm font-medium">{state.name}</h6>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-tertiary">{t("project_settings.workflows.allow_new_work_items")}</span>
                  <ToggleSwitch value={true} onChange={() => {}} disabled={!isAdmin} size="sm" />
                </div>
              </div>
            </div>
            <button
              type="button"
              className={cn(
                "mt-3 text-xs text-primary-light hover:text-primary",
                !isAdmin && "cursor-not-allowed opacity-50"
              )}
              disabled={!isAdmin}
            >
              {t("project_settings.workflows.add_permitted_state_change")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
