"use client";

import { useEffect } from "react";
import { observer } from "mobx-react";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import useSWR from "swr";
// plane imports
import { useTranslation } from "@plane/i18n";
import { EIssueServiceType } from "@plane/types";
// assets
import emptyIssueDark from "@/app/assets/empty-state/search/issues-dark.webp?url";
import emptyIssueLight from "@/app/assets/empty-state/search/issues-light.webp?url";
// components
import { EmptyState } from "@/components/common/empty-state";
import { LogoSpinner } from "@/components/common/logo-spinner";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useAppRouter } from "@/hooks/use-app-router";

function EpicDetailsPage() {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { workspaceSlug, projectId, epicId } = useParams();
  // store hooks
  const { fetchIssue, issue: issueStore, setPeekIssue } = useIssueDetail(EIssueServiceType.EPICS);

  // Fetch the epic details
  const { isLoading, error } = useSWR(
    workspaceSlug && projectId && epicId ? `EPIC_DETAIL_${workspaceSlug}_${projectId}_${epicId}` : null,
    workspaceSlug && projectId && epicId
      ? () => fetchIssue(workspaceSlug.toString(), projectId.toString(), epicId.toString())
      : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  const epicDetails = epicId ? issueStore.getIssueById(epicId.toString()) : undefined;

  // When epic is loaded, open peek overview and redirect to list view
  useEffect(() => {
    if (epicDetails && workspaceSlug && projectId && epicId) {
      // Set peek issue to open the epic detail panel
      setPeekIssue({
        workspaceSlug: workspaceSlug.toString(),
        projectId: projectId.toString(),
        issueId: epicId.toString(),
      });
      // Redirect to the epics list with peek overlay
      router.replace(`/${workspaceSlug}/projects/${projectId}/epics/?peekId=${epicId}`);
    }
  }, [epicDetails, workspaceSlug, projectId, epicId, setPeekIssue, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center size-full">
        <LogoSpinner />
      </div>
    );
  }

  // Show error state if epic not found
  if (error || (!isLoading && !epicDetails)) {
    return (
      <div className="flex items-center justify-center size-full">
        <EmptyState
          image={resolvedTheme === "dark" ? emptyIssueDark : emptyIssueLight}
          title={t("project_settings.epics.not_found")}
          description={t("project_settings.epics.not_found_description")}
          primaryButton={{
            text: t("project_settings.epics.view_all"),
            onClick: () => router.push(`/${workspaceSlug}/projects/${projectId}/epics`),
          }}
        />
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center size-full">
      <LogoSpinner />
    </div>
  );
}

export default observer(EpicDetailsPage);
