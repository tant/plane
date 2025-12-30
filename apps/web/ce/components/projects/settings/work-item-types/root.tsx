import { useEffect } from "react";
import { observer } from "mobx-react";
import { Plus } from "lucide-react";
import { useTranslation } from "@plane/i18n";
import { Button, ToggleSwitch, Loader } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useIssueType } from "@/hooks/store/use-issue-type";

type Props = {
  workspaceSlug: string;
  projectId: string;
  isAdmin: boolean;
};

export const ProjectWorkItemTypesRoot = observer(function ProjectWorkItemTypesRoot(props: Props) {
  const { workspaceSlug, projectId, isAdmin } = props;
  const { t } = useTranslation();
  // store hooks
  const {
    getProjectIssueTypes,
    projectFetchedMap,
    fetchProjectIssueTypes,
    getIssueTypeById
  } = useIssueType();

  // Fetch project issue types
  useEffect(() => {
    if (workspaceSlug && projectId && !projectFetchedMap[projectId]) {
      fetchProjectIssueTypes(workspaceSlug, projectId);
    }
  }, [workspaceSlug, projectId, projectFetchedMap, fetchProjectIssueTypes]);

  const projectIssueTypes = getProjectIssueTypes(projectId);
  const isLoading = !projectFetchedMap[projectId];

  if (isLoading) {
    return (
      <Loader className="space-y-4">
        <Loader.Item height="60px" />
        <Loader.Item height="60px" />
        <Loader.Item height="60px" />
      </Loader>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          prependIcon={<Plus className="h-4 w-4" />}
          disabled={!isAdmin}
        >
          {t("project_settings.work_item_types.add_type")}
        </Button>
      </div>

      {/* Types list */}
      <div className="space-y-2">
        {projectIssueTypes?.map((projectIssueType) => {
          const issueType = getIssueTypeById(projectIssueType.issue_type_id);
          if (!issueType) return null;

          return (
            <div
              key={projectIssueType.id}
              className={cn(
                "flex items-center justify-between rounded-lg border border-subtle bg-surface-1 p-4",
                "cursor-pointer hover:bg-surface-2"
              )}
            >
              <div className="flex items-center gap-3">
                {issueType.logo_props?.in_use === "icon" && issueType.logo_props?.icon?.name && (
                  <span className="text-lg">{issueType.logo_props.icon.name}</span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{issueType.name}</span>
                    {projectIssueType.is_default && (
                      <span className="rounded-sm bg-surface-3 px-1.5 py-0.5 text-xs text-tertiary">
                        {t("common.default")}
                      </span>
                    )}
                  </div>
                  {issueType.description && (
                    <p className="text-xs text-tertiary">{issueType.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!projectIssueType.is_default && (
                  <ToggleSwitch
                    value={true}
                    onChange={() => {}}
                    disabled={!isAdmin}
                    size="sm"
                  />
                )}
              </div>
            </div>
          );
        })}

        {(!projectIssueTypes || projectIssueTypes.length === 0) && (
          <div className="rounded-lg border border-dashed border-subtle p-8 text-center">
            <p className="text-sm text-tertiary">{t("project_settings.work_item_types.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
});
