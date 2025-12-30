"use client";

import type { FC } from "react";
import { useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { Plus, MoreHorizontal } from "lucide-react";
// plane imports
import { StateGroupIcon, PriorityIcon } from "@plane/propel/icons";
import type { TIssue, ISearchIssueResponse } from "@plane/types";
import { EIssueServiceType } from "@plane/types";
import { CustomMenu, Avatar } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useProjectState } from "@/hooks/store/use-project-state";
import { useMember } from "@/hooks/store/use-member";
import { useProject } from "@/hooks/store/use-project";
// components
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";
import { ExistingIssuesListModal } from "@/components/core/modals/existing-issues-list-modal";

type TEpicWorkItemsSectionProps = {
  workspaceSlug: string;
  projectId: string;
  epicId: string;
  disabled?: boolean;
};

type TActiveTab = "work-items" | "relations";

export const EpicWorkItemsSection: FC<TEpicWorkItemsSectionProps> = observer((props) => {
  const { workspaceSlug, projectId, epicId, disabled = false } = props;

  // state
  const [activeTab, setActiveTab] = useState<TActiveTab>("work-items");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExistingModalOpen, setIsExistingModalOpen] = useState(false);

  // store hooks
  const {
    issue: { getIssueById },
    subIssues: { subIssuesByIssueId },
    createSubIssues,
    relation: { getRelationsByIssueId },
  } = useIssueDetail(EIssueServiceType.EPICS);
  const { getStateById } = useProjectState();
  const { getUserDetails } = useMember();
  const { getProjectIdentifierById } = useProject();

  // derived values
  const subIssueIds = subIssuesByIssueId(epicId) || [];
  const relations = getRelationsByIssueId(epicId);
  const projectIdentifier = getProjectIdentifierById(projectId);
  const relationsCount = relations ? Object.values(relations).flat().length : 0;

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleAddExisting = () => {
    setIsExistingModalOpen(true);
  };

  const handleCreateModalSubmit = async (issue: TIssue) => {
    if (issue.id) {
      await createSubIssues(workspaceSlug, projectId, epicId, [issue.id]);
    }
    setIsCreateModalOpen(false);
  };

  const handleExistingModalSubmit = async (issues: ISearchIssueResponse[]) => {
    if (issues.length > 0) {
      await createSubIssues(
        workspaceSlug,
        projectId,
        epicId,
        issues.map((i) => i.id)
      );
    }
    setIsExistingModalOpen(false);
  };

  const renderWorkItemRow = (issueId: string) => {
    const issue = getIssueById(issueId);
    if (!issue) return null;

    const state = issue.state_id ? getStateById(issue.state_id) : null;
    const assignees = issue.assignee_ids || [];

    return (
      <Link
        key={issueId}
        href={`/${workspaceSlug}/browse/${projectIdentifier}-${issue.sequence_id}/`}
        className="flex items-center justify-between py-2 px-3 hover:bg-custom-background-80 rounded-md transition-colors group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {state && <StateGroupIcon stateGroup={state.group} color={state.color} />}
            <span className="text-xs text-custom-text-300">
              {projectIdentifier}-{issue.sequence_id}
            </span>
          </div>
          <span className="text-sm text-custom-text-100 truncate">{issue.name}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {state && (
            <div className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-custom-border-200 bg-custom-background-100">
              <StateGroupIcon stateGroup={state.group} color={state.color} />
              <span>{state.name}</span>
            </div>
          )}
          {issue.priority && (
            <div className="p-1 rounded border border-custom-border-200 bg-custom-background-100">
              <PriorityIcon priority={issue.priority} />
            </div>
          )}
          {assignees.length > 0 && (
            <div className="flex -space-x-1">
              {assignees.slice(0, 2).map((assigneeId) => {
                const user = getUserDetails(assigneeId);
                return user ? (
                  <Avatar key={assigneeId} name={user.display_name} src={user.avatar_url} size="sm" />
                ) : null;
              })}
              {assignees.length > 2 && (
                <div className="h-5 w-5 rounded-full bg-custom-background-80 flex items-center justify-center text-xs text-custom-text-300">
                  +{assignees.length - 2}
                </div>
              )}
            </div>
          )}
          <button className="p-1 rounded hover:bg-custom-background-90">
            <MoreHorizontal className="h-3.5 w-3.5 text-custom-text-300" />
          </button>
        </div>
      </Link>
    );
  };

  const tabs = [
    { id: "work-items" as const, label: "Work items", count: subIssueIds.length },
    { id: "relations" as const, label: "Relations", count: relationsCount },
  ];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-custom-text-200">Overview</div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-custom-border-200">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "pb-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-custom-primary-100 text-custom-text-100"
                  : "border-transparent text-custom-text-300 hover:text-custom-text-200"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-custom-background-80">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "work-items" && !disabled && (
          <div className="flex items-center gap-1 pb-2">
            <CustomMenu
              customButton={
                <button className="p-1 rounded hover:bg-custom-background-80">
                  <Plus className="h-4 w-4 text-custom-text-300" />
                </button>
              }
              placement="bottom-end"
            >
              <CustomMenu.MenuItem onClick={handleCreateNew}>Create new</CustomMenu.MenuItem>
              <CustomMenu.MenuItem onClick={handleAddExisting}>Add existing</CustomMenu.MenuItem>
            </CustomMenu>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {activeTab === "work-items" && (
          <>
            {subIssueIds.length > 0 ? (
              subIssueIds.map((issueId) => renderWorkItemRow(issueId))
            ) : (
              <div className="py-8 text-center text-sm text-custom-text-300">No work items linked to this epic</div>
            )}
          </>
        )}

        {activeTab === "relations" && (
          <div className="py-8 text-center text-sm text-custom-text-300">
            {relationsCount > 0 ? `${relationsCount} relations` : "No relations found"}
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateUpdateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        data={{ parent_id: epicId, project_id: projectId }}
        onSubmit={handleCreateModalSubmit}
        isProjectSelectionDisabled
      />

      {/* Existing issues modal */}
      <ExistingIssuesListModal
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        isOpen={isExistingModalOpen}
        handleClose={() => setIsExistingModalOpen(false)}
        searchParams={{ sub_issue: true, issue_id: epicId }}
        handleOnSubmit={handleExistingModalSubmit}
      />
    </div>
  );
});
