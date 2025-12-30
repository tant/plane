"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import useSWR from "swr";
import { Controller, useForm } from "react-hook-form";
import { ChevronDown, ChevronRight, Link2, Paperclip, Users, Signal, CircleDot, ExternalLink, Trash2, CalendarDays, RefreshCw, FileText, Plus, Edit3 } from "lucide-react";
// plane imports
import { STATE_GROUPS, MAX_FILE_SIZE } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { EmojiPicker, EmojiIconPickerTypes, Logo } from "@plane/propel/emoji-icon-picker";
import { OverviewIcon, StateGroupIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EFileAssetType, EIssuesStoreType } from "@plane/types";
import type { IProject, TStateGroups, TProjectLink, TProjectLinkEditableFields, ICycle, IUserLite, TProjectState, TProjectPriority, IProjectUpdate, TProjectUpdateCategory } from "@plane/types";
import { Loader, Tooltip } from "@plane/ui";
import { cn, getFileURL, calculateTimeAgo, convertBytesToSize } from "@plane/utils";
// components
import { CoverImage } from "@/components/common/cover-image";
import { ActivityMessage, IssueLink } from "@/components/core/activity";
import { ImagePickerPopover } from "@/components/core/image-picker-popover";
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { DateDropdown } from "@/components/dropdowns/date";
import { PriorityDropdown } from "@/components/dropdowns/priority";
// helpers
import { handleCoverImageChange } from "@/helpers/cover-image.helper";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useProjectState } from "@/hooks/store/use-project-state";
import { useIssues } from "@/hooks/store/use-issues";
import { useMember } from "@/hooks/store/use-member";
import { useProjectLink } from "@/hooks/store/use-project-link";
import { useProjectAttachment } from "@/hooks/store/use-project-attachment";
import { useUser } from "@/hooks/store/user";
import { useCycle } from "@/hooks/store/use-cycle";
// services
import { ProjectService } from "@/services/project/project.service";
import { ProjectUpdateService } from "@/services/project/project-update.service";
// local components
import type { TProjectLinkOperations } from "./link-modal";
import { ProjectLinkModal } from "./link-modal";

const projectService = new ProjectService();
const projectUpdateService = new ProjectUpdateService();

// Project update category options
const PROJECT_UPDATE_CATEGORIES: { key: TProjectUpdateCategory; title: string; color: string }[] = [
  { key: "progress", title: "Progress", color: "#0ea5e9" },
  { key: "milestone", title: "Milestone", color: "#22c55e" },
  { key: "blocker", title: "Blocker", color: "#ef4444" },
  { key: "general", title: "General", color: "#6366f1" },
];

// Project state options
const PROJECT_STATE_OPTIONS: { key: TProjectState; title: string; color: string }[] = [
  { key: "draft", title: "Draft", color: "#94a3b8" },
  { key: "planning", title: "Planning", color: "#6366f1" },
  { key: "execution", title: "Execution", color: "#0ea5e9" },
  { key: "monitoring", title: "Monitoring", color: "#f59e0b" },
  { key: "completed", title: "Completed", color: "#22c55e" },
  { key: "cancelled", title: "Cancelled", color: "#ef4444" },
];

type TProjectOverviewRootProps = {
  workspaceSlug: string;
  projectId: string;
};

type TStateGroupProgress = {
  group: TStateGroups;
  count: number;
  percentage: number;
};

export const ProjectOverviewRoot = observer(function ProjectOverviewRoot(props: TProjectOverviewRootProps) {
  const { workspaceSlug, projectId } = props;
  // refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  // states
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [_isUpdating, setIsUpdating] = useState(false);
  const [isMilestonesExpanded, setIsMilestonesExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"properties" | "updates" | "links" | "activity">("properties");
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  // Project Updates state
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);
  const [newUpdateTitle, setNewUpdateTitle] = useState("");
  const [newUpdateDescription, setNewUpdateDescription] = useState("");
  const [newUpdateCategory, setNewUpdateCategory] = useState<TProjectUpdateCategory>("general");
  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [editingUpdateTitle, setEditingUpdateTitle] = useState("");
  const [editingUpdateDescription, setEditingUpdateDescription] = useState("");
  const [editingUpdateCategory, setEditingUpdateCategory] = useState<TProjectUpdateCategory>("general");
  // store hooks
  const { currentProjectDetails, updateProject } = useProject();
  const { projectStates } = useProjectState();
  const { issueMap } = useIssues(EIssuesStoreType.PROJECT);
  const {
    project: { getProjectMemberIds },
  } = useMember();
  const {
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    getLinksByProjectId,
    getLinkById,
    isLinkModalOpen,
    toggleLinkModal,
    linkData,
    setLinkData,
  } = useProjectLink();
  const {
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    getAttachmentsByProjectId,
    getAttachmentById,
  } = useProjectAttachment();
  const { data: currentUser } = useUser();
  const { fetchActiveCycle, getProjectCycleIds, getCycleById, loader: cycleLoader } = useCycle();
  // i18n
  const { t } = useTranslation();

  // Fetch links and attachments
  useSWR(
    workspaceSlug && projectId ? `PROJECT_LINKS_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchLinks(workspaceSlug, projectId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  useSWR(
    workspaceSlug && projectId ? `PROJECT_ATTACHMENTS_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchAttachments(workspaceSlug, projectId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  // Fetch project activity (all work item activities in this project)
  const {
    data: projectActivity,
    mutate: mutateActivity,
    isValidating: isActivityLoading,
  } = useSWR(
    workspaceSlug && projectId ? `PROJECT_ACTIVITY_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId
      ? () =>
          projectService.getProjectActivity(workspaceSlug, projectId, {
            per_page: 10,
          })
      : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  // Fetch active cycles
  useSWR(
    workspaceSlug && projectId ? `PROJECT_ACTIVE_CYCLES_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchActiveCycle(workspaceSlug, projectId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  // Fetch project updates (only if enabled)
  const isProjectUpdatesEnabled = currentProjectDetails?.is_project_updates_enabled ?? false;
  const {
    data: projectUpdates,
    mutate: mutateUpdates,
    isValidating: isUpdatesLoading,
  } = useSWR(
    workspaceSlug && projectId && isProjectUpdatesEnabled ? `PROJECT_UPDATES_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId && isProjectUpdatesEnabled
      ? () => projectUpdateService.fetchUpdates(workspaceSlug, projectId)
      : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  // Get links and attachments
  const linkIds = getLinksByProjectId(projectId);
  const attachmentIds = getAttachmentsByProjectId(projectId);

  // Get active cycles (milestones)
  const projectCycleIds = getProjectCycleIds(projectId);
  const activeCycles = useMemo((): ICycle[] => {
    if (!projectCycleIds) return [];
    return projectCycleIds
      .map((cycleId) => getCycleById(cycleId))
      .filter((cycle): cycle is ICycle => cycle !== null && cycle.status === "current");
  }, [projectCycleIds, getCycleById]);

  // form
  const { control, watch, reset } = useForm<Partial<IProject>>({
    defaultValues: {
      cover_image_url: currentProjectDetails?.cover_image_url,
      logo_props: currentProjectDetails?.logo_props,
    },
  });

  // Reset form when project details change
  useEffect(() => {
    if (currentProjectDetails) {
      reset({
        cover_image_url: currentProjectDetails.cover_image_url,
        logo_props: currentProjectDetails.logo_props,
      });
    }
  }, [currentProjectDetails, reset]);

  const coverImage = watch("cover_image_url");

  // Get project members count
  const projectMemberIds = getProjectMemberIds(projectId, true);
  const memberCount = projectMemberIds?.length ?? 0;

  // Calculate state group progress
  const stateGroupProgress = useMemo((): TStateGroupProgress[] => {
    if (!projectStates || !issueMap) return [];

    // Group states by state group
    const statesByGroup: Record<TStateGroups, string[]> = {
      backlog: [],
      unstarted: [],
      started: [],
      completed: [],
      cancelled: [],
    };

    projectStates.forEach((state) => {
      if (state.group && statesByGroup[state.group as TStateGroups]) {
        statesByGroup[state.group as TStateGroups].push(state.id);
      }
    });

    // Count issues per state group
    const issueCountByGroup: Record<TStateGroups, number> = {
      backlog: 0,
      unstarted: 0,
      started: 0,
      completed: 0,
      cancelled: 0,
    };

    Object.values(issueMap).forEach((issue) => {
      if (issue.project_id === projectId && issue.state_id) {
        for (const [group, stateIds] of Object.entries(statesByGroup)) {
          if (stateIds.includes(issue.state_id)) {
            issueCountByGroup[group as TStateGroups]++;
            break;
          }
        }
      }
    });

    const totalIssues = Object.values(issueCountByGroup).reduce((sum, count) => sum + count, 0);

    return (Object.keys(STATE_GROUPS) as TStateGroups[]).map((group) => ({
      group,
      count: issueCountByGroup[group],
      percentage: totalIssues > 0 ? Math.round((issueCountByGroup[group] / totalIssues) * 100) : 0,
    }));
  }, [projectStates, issueMap, projectId]);

  // Handle cover image update
  const handleCoverImageUpdate = useCallback(
    async (newCoverImage: string | null) => {
      if (!currentProjectDetails) return;

      setIsUpdating(true);
      try {
        const coverImagePayload = await handleCoverImageChange(
          currentProjectDetails.cover_image_url,
          newCoverImage,
          {
            workspaceSlug,
            entityIdentifier: projectId,
            entityType: EFileAssetType.PROJECT_COVER,
            isUserAsset: false,
          }
        );

        if (coverImagePayload) {
          await updateProject(workspaceSlug, projectId, coverImagePayload as Partial<IProject>);
        }

        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.cover_image_updated"),
        });
      } catch (error) {
        console.error("Error updating cover image:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [currentProjectDetails, workspaceSlug, projectId, updateProject, t]
  );

  // Handle logo/emoji update
  const handleLogoUpdate = useCallback(
    async (logoProps: IProject["logo_props"]) => {
      if (!currentProjectDetails) return;

      setIsUpdating(true);
      try {
        await updateProject(workspaceSlug, projectId, { logo_props: logoProps });
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.logo_updated"),
        });
      } catch (error) {
        console.error("Error updating logo:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [currentProjectDetails, workspaceSlug, projectId, updateProject, t]
  );

  // Link operations
  const linkOperations: Omit<TProjectLinkOperations, "remove"> = useMemo(
    () => ({
      create: async (data: TProjectLinkEditableFields) => {
        try {
          await createLink(workspaceSlug, projectId, data);
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: t("toast.success"),
            message: t("project_overview.link_added"),
          });
        } catch (error) {
          console.error("Error creating link:", error);
          setToast({
            type: TOAST_TYPE.ERROR,
            title: t("toast.error"),
            message: t("something_went_wrong"),
          });
          throw error;
        }
      },
      update: async (linkId: string, data: Partial<TProjectLinkEditableFields>) => {
        try {
          await updateLink(workspaceSlug, projectId, linkId, data);
          setToast({
            type: TOAST_TYPE.SUCCESS,
            title: t("toast.success"),
            message: t("project_overview.link_updated"),
          });
        } catch (error) {
          console.error("Error updating link:", error);
          setToast({
            type: TOAST_TYPE.ERROR,
            title: t("toast.error"),
            message: t("something_went_wrong"),
          });
          throw error;
        }
      },
    }),
    [workspaceSlug, projectId, createLink, updateLink, t]
  );

  // Handle link deletion
  const handleDeleteLink = useCallback(
    async (linkId: string) => {
      try {
        await deleteLink(workspaceSlug, projectId, linkId);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.link_removed"),
        });
      } catch (error) {
        console.error("Error deleting link:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      }
    },
    [workspaceSlug, projectId, deleteLink, t]
  );

  // Handle add link button click
  const handleAddLink = useCallback(() => {
    setLinkData(undefined);
    toggleLinkModal(true);
  }, [setLinkData, toggleLinkModal]);

  // Handle edit link
  const handleEditLink = useCallback(
    (link: TProjectLink) => {
      setLinkData(link);
      toggleLinkModal(true);
    },
    [setLinkData, toggleLinkModal]
  );

  // Handle file attachment
  const handleAttachmentUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("project_overview.file_too_large"),
        });
        return;
      }

      setIsUploadingAttachment(true);
      try {
        await uploadAttachment(workspaceSlug, projectId, file);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.attachment_added"),
        });
      } catch (error) {
        console.error("Error uploading attachment:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      } finally {
        setIsUploadingAttachment(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [workspaceSlug, projectId, uploadAttachment, t]
  );

  // Handle delete attachment
  const handleDeleteAttachment = useCallback(
    async (attachmentId: string) => {
      try {
        await deleteAttachment(workspaceSlug, projectId, attachmentId);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.attachment_removed"),
        });
      } catch (error) {
        console.error("Error deleting attachment:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      }
    },
    [workspaceSlug, projectId, deleteAttachment, t]
  );

  // Handle project lead update
  const handleLeadUpdate = useCallback(
    async (memberId: string | undefined) => {
      if (!currentProjectDetails) return;

      const leadValue = memberId === undefined || memberId === "" ? null : memberId;
      try {
        await updateProject(workspaceSlug, projectId, { project_lead: leadValue });
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.lead_updated"),
        });
      } catch (error) {
        console.error("Error updating project lead:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      }
    },
    [currentProjectDetails, workspaceSlug, projectId, updateProject, t]
  );

  // Handle project state update
  const handleProjectStateUpdate = useCallback(
    async (state: TProjectState) => {
      if (!currentProjectDetails) return;

      try {
        await updateProject(workspaceSlug, projectId, { project_state: state });
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.state_updated"),
        });
      } catch (error) {
        console.error("Error updating project state:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      }
    },
    [currentProjectDetails, workspaceSlug, projectId, updateProject, t]
  );

  // Handle project priority update
  const handlePriorityUpdate = useCallback(
    async (priority: TProjectPriority) => {
      if (!currentProjectDetails) return;

      try {
        await updateProject(workspaceSlug, projectId, { priority });
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.priority_updated"),
        });
      } catch (error) {
        console.error("Error updating project priority:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      }
    },
    [currentProjectDetails, workspaceSlug, projectId, updateProject, t]
  );

  // Handle start date update
  const handleStartDateUpdate = useCallback(
    async (date: Date | null) => {
      if (!currentProjectDetails) return;

      try {
        await updateProject(workspaceSlug, projectId, {
          start_date: date ? date.toISOString().split("T")[0] : null,
        });
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.start_date_updated"),
        });
      } catch (error) {
        console.error("Error updating start date:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      }
    },
    [currentProjectDetails, workspaceSlug, projectId, updateProject, t]
  );

  // Handle target date update
  const handleTargetDateUpdate = useCallback(
    async (date: Date | null) => {
      if (!currentProjectDetails) return;

      try {
        await updateProject(workspaceSlug, projectId, {
          target_date: date ? date.toISOString().split("T")[0] : null,
        });
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: t("toast.success"),
          message: t("project_overview.target_date_updated"),
        });
      } catch (error) {
        console.error("Error updating target date:", error);
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("toast.error"),
          message: t("something_went_wrong"),
        });
      }
    },
    [currentProjectDetails, workspaceSlug, projectId, updateProject, t]
  );

  // Project Updates handlers
  const handleCreateUpdate = useCallback(async () => {
    if (!newUpdateTitle.trim()) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("project_overview.update_title_required"),
      });
      return;
    }

    try {
      await projectUpdateService.createUpdate(workspaceSlug, projectId, {
        title: newUpdateTitle.trim(),
        description: newUpdateDescription.trim(),
        category: newUpdateCategory,
      });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("toast.success"),
        message: t("project_overview.update_created"),
      });
      setNewUpdateTitle("");
      setNewUpdateDescription("");
      setNewUpdateCategory("general");
      setIsCreatingUpdate(false);
      void mutateUpdates();
    } catch (error) {
      console.error("Error creating update:", error);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("something_went_wrong"),
      });
    }
  }, [workspaceSlug, projectId, newUpdateTitle, newUpdateDescription, newUpdateCategory, mutateUpdates, t]);

  const handleEditUpdate = useCallback(async (updateId: string) => {
    if (!editingUpdateTitle.trim()) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("project_overview.update_title_required"),
      });
      return;
    }

    try {
      await projectUpdateService.updateUpdate(workspaceSlug, projectId, updateId, {
        title: editingUpdateTitle.trim(),
        description: editingUpdateDescription.trim(),
        category: editingUpdateCategory,
      });
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("toast.success"),
        message: t("project_overview.update_updated"),
      });
      setEditingUpdateId(null);
      setEditingUpdateTitle("");
      setEditingUpdateDescription("");
      setEditingUpdateCategory("general");
      void mutateUpdates();
    } catch (error) {
      console.error("Error updating update:", error);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("something_went_wrong"),
      });
    }
  }, [workspaceSlug, projectId, editingUpdateTitle, editingUpdateDescription, editingUpdateCategory, mutateUpdates, t]);

  const handleDeleteUpdate = useCallback(async (updateId: string) => {
    try {
      await projectUpdateService.deleteUpdate(workspaceSlug, projectId, updateId);
      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("toast.success"),
        message: t("project_overview.update_deleted"),
      });
      void mutateUpdates();
    } catch (error) {
      console.error("Error deleting update:", error);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("toast.error"),
        message: t("something_went_wrong"),
      });
    }
  }, [workspaceSlug, projectId, mutateUpdates, t]);

  const startEditingUpdate = useCallback((update: IProjectUpdate) => {
    setEditingUpdateId(update.id);
    setEditingUpdateTitle(update.title);
    setEditingUpdateDescription(update.description);
    setEditingUpdateCategory(update.category);
  }, []);

  const cancelEditingUpdate = useCallback(() => {
    setEditingUpdateId(null);
    setEditingUpdateTitle("");
    setEditingUpdateDescription("");
    setEditingUpdateCategory("general");
  }, []);

  // Get project lead ID
  const projectLeadId = useMemo(() => {
    if (!currentProjectDetails?.project_lead) return undefined;
    if (typeof currentProjectDetails.project_lead === "string") {
      return currentProjectDetails.project_lead;
    }
    return (currentProjectDetails.project_lead as IUserLite).id;
  }, [currentProjectDetails?.project_lead]);

  // Get project lead details for display (kept for future use)
  const _projectLeadDetails = useMemo(() => {
    if (!currentProjectDetails?.project_lead) return null;
    if (typeof currentProjectDetails.project_lead === "object") {
      return currentProjectDetails.project_lead;
    }
    return null;
  }, [currentProjectDetails?.project_lead]);

  if (!currentProjectDetails) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="w-full max-w-4xl">
          <Loader.Item height="200px" width="100%" />
          <Loader.Item height="40px" width="60%" />
          <Loader.Item height="200px" width="100%" />
        </Loader>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header breadcrumb */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-subtle px-4">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded px-2 py-1 text-sm hover:bg-layer-2">
            <Logo logo={currentProjectDetails.logo_props} size={14} />
            <span className="font-medium">{currentProjectDetails.name}</span>
            <ChevronDown className="h-3 w-3 text-tertiary" />
          </button>
          <Link
            href={`/${workspaceSlug}/projects/${projectId}/overview`}
            className="flex items-center gap-1.5 rounded bg-layer-2 px-2 py-1 text-sm"
          >
            <OverviewIcon className="h-3.5 w-3.5" />
            <span>{t("sidebar.overview")}</span>
          </Link>
        </div>
        <button className="rounded p-1 hover:bg-layer-2">
          <ChevronRight className="h-4 w-4 text-tertiary" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            {/* Cover image section */}
            <div className="relative">
              <CoverImage
                src={coverImage}
                alt={currentProjectDetails.name}
                className="h-44 w-full object-cover"
                showDefaultWhenEmpty
              />
              <div className="absolute bottom-3 right-3">
                <Controller
                  control={control}
                  name="cover_image_url"
                  render={({ field: { value, onChange } }) => (
                    <ImagePickerPopover
                      label={t("change_cover")}
                      control={control as any}
                      onChange={(newValue) => {
                        onChange(newValue);
                        handleCoverImageUpdate(newValue);
                      }}
                      value={value ?? null}
                      projectId={projectId}
                    />
                  )}
                />
              </div>
            </div>

            {/* Project emoji and name */}
            <div className="flex items-center gap-3 px-6 -mt-5 relative z-10">
              <Controller
                control={control}
                name="logo_props"
                render={({ field: { value, onChange } }) => (
                  <EmojiPicker
                    iconType="material"
                    closeOnSelect={false}
                    isOpen={isEmojiPickerOpen}
                    handleToggle={(val: boolean) => setIsEmojiPickerOpen(val)}
                    className="flex items-center justify-center"
                    buttonClassName="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-layer-1 border border-subtle shadow-sm hover:bg-layer-2 transition-colors"
                    label={<Logo logo={value} size={28} />}
                    onChange={(val: { type: string; value: unknown }) => {
                      let logoValue = {};

                      if (val?.type === "emoji")
                        logoValue = {
                          value: val.value,
                        };
                      else if (val?.type === "icon") logoValue = val.value as Record<string, unknown>;

                      const newLogoProps = {
                        in_use: val?.type,
                        [val?.type]: logoValue,
                      };

                      onChange(newLogoProps);
                      void handleLogoUpdate(newLogoProps as IProject["logo_props"]);
                      setIsEmojiPickerOpen(false);
                    }}
                    defaultIconColor={value?.in_use && value.in_use === "icon" ? value?.icon?.color : undefined}
                    defaultOpen={
                      value?.in_use && value.in_use === "emoji" ? EmojiIconPickerTypes.EMOJI : EmojiIconPickerTypes.ICON
                    }
                  />
                )}
              />
              <h1 className="text-xl font-semibold text-primary">{currentProjectDetails.name}</h1>
            </div>

            {/* Description area */}
            <div className="px-6 py-6">
              <div className="min-h-[200px] rounded-lg">
                <p className="text-secondary whitespace-pre-wrap">
                  {currentProjectDetails.description || t("project_overview.no_description")}
                </p>
              </div>

              {/* Add link / Attach buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="flex items-center gap-1.5 rounded border border-subtle px-3 py-1.5 text-sm text-secondary hover:bg-layer-2 transition-colors"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>{t("project_overview.add_link")}</span>
                </button>
                <label className="flex items-center gap-1.5 rounded border border-subtle px-3 py-1.5 text-sm text-secondary hover:bg-layer-2 transition-colors cursor-pointer">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{isUploadingAttachment ? t("uploading") : t("project_overview.attach")}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleAttachmentUpload}
                    disabled={isUploadingAttachment}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 shrink-0 border-l border-subtle overflow-y-auto">
          {/* Progress section */}
          <div className="border-b border-subtle p-4">
            <h3 className="text-sm font-medium text-primary mb-3">{t("project_overview.progress")}</h3>
            <div className="space-y-2">
              {stateGroupProgress.map((item) => (
                <div key={item.group} className="flex items-center justify-between py-1">
                  <span className="text-sm text-secondary capitalize">{STATE_GROUPS[item.group]?.label}</span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-primary">{item.count}</span>
                    <span className="text-tertiary">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones section (Active Cycles) */}
          <div className="border-b border-subtle">
            <button
              type="button"
              onClick={() => setIsMilestonesExpanded(!isMilestonesExpanded)}
              className="flex w-full items-center justify-between p-4 hover:bg-layer-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <StateGroupIcon stateGroup="started" className="h-4 w-4" />
                <span className="text-sm font-medium">{t("project_overview.milestones")}</span>
                {activeCycles.length > 0 && (
                  <span className="text-xs bg-layer-3 px-1.5 py-0.5 rounded text-secondary">
                    {activeCycles.length}
                  </span>
                )}
              </div>
              <ChevronDown className={cn("h-4 w-4 text-tertiary transition-transform", isMilestonesExpanded && "rotate-180")} />
            </button>
            {isMilestonesExpanded && (
              <div className="px-4 pb-4">
                {cycleLoader ? (
                  <Loader className="space-y-2">
                    <Loader.Item height="60px" />
                  </Loader>
                ) : activeCycles.length > 0 ? (
                  <div className="space-y-2">
                    {activeCycles.map((cycle) => {
                      if (!cycle) return null;
                      const progress = cycle.total_issues > 0
                        ? Math.round((cycle.completed_issues / cycle.total_issues) * 100)
                        : 0;
                      return (
                        <Link
                          key={cycle.id}
                          href={`/${workspaceSlug}/projects/${projectId}/cycles/${cycle.id}`}
                          className="block rounded-lg border border-subtle p-3 hover:bg-layer-2 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-primary truncate">{cycle.name}</span>
                            <span className="text-xs text-secondary">{progress}%</span>
                          </div>
                          <div className="w-full bg-layer-3 rounded-full h-1.5">
                            <div
                              className="bg-accent-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-tertiary">
                            <span>{cycle.completed_issues}/{cycle.total_issues} {t("issues")}</span>
                            {cycle.end_date && (
                              <span>{new Date(cycle.end_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-subtle p-4 text-center">
                    <StateGroupIcon stateGroup="backlog" className="h-8 w-8 mx-auto text-tertiary mb-2" />
                    <p className="text-sm text-secondary">{t("project_overview.no_milestones")}</p>
                    <p className="text-xs text-tertiary mt-1">{t("project_overview.milestones_description")}</p>
                    <Link
                      href={`/${workspaceSlug}/projects/${projectId}/cycles`}
                      className="mt-3 text-sm text-accent-primary hover:underline inline-block"
                    >
                      {t("project_overview.create_milestone")}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Properties panel with tabs */}
          <div>
            {/* Tab buttons */}
            <div className="flex items-center border-b border-subtle">
              <button
                onClick={() => setActiveTab("properties")}
                className={cn(
                  "flex-1 py-2 text-center",
                  activeTab === "properties" ? "border-b-2 border-accent-primary" : ""
                )}
              >
                <CircleDot className={cn("h-4 w-4 mx-auto", activeTab === "properties" ? "text-accent-primary" : "text-tertiary")} />
              </button>
              {isProjectUpdatesEnabled && (
                <button
                  onClick={() => setActiveTab("updates")}
                  className={cn(
                    "flex-1 py-2 text-center",
                    activeTab === "updates" ? "border-b-2 border-accent-primary" : ""
                  )}
                >
                  <FileText className={cn("h-4 w-4 mx-auto", activeTab === "updates" ? "text-accent-primary" : "text-tertiary")} />
                </button>
              )}
              <button
                onClick={() => setActiveTab("links")}
                className={cn(
                  "flex-1 py-2 text-center",
                  activeTab === "links" ? "border-b-2 border-accent-primary" : ""
                )}
              >
                <Link2 className={cn("h-4 w-4 mx-auto", activeTab === "links" ? "text-accent-primary" : "text-tertiary")} />
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={cn(
                  "flex-1 py-2 text-center",
                  activeTab === "activity" ? "border-b-2 border-accent-primary" : ""
                )}
              >
                <Signal className={cn("h-4 w-4 mx-auto", activeTab === "activity" ? "text-accent-primary" : "text-tertiary")} />
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "properties" && (
              <div className="p-4">
                <h5 className="text-xs font-medium text-secondary mb-3">{t("project_overview.properties")}</h5>
                <div className="space-y-3">
                  {/* State */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <CircleDot className="h-3.5 w-3.5" />
                      <span>{t("project_overview.state")}</span>
                    </div>
                    <div className="relative">
                      <select
                        value={currentProjectDetails.project_state || "draft"}
                        onChange={(e) => handleProjectStateUpdate(e.target.value as TProjectState)}
                        className="appearance-none bg-transparent text-sm px-2 py-1 pr-6 rounded hover:bg-layer-2 cursor-pointer border-0 focus:outline-none focus:ring-0"
                      >
                        {PROJECT_STATE_OPTIONS.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 text-tertiary pointer-events-none" />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Signal className="h-3.5 w-3.5" />
                      <span>{t("priority")}</span>
                    </div>
                    <PriorityDropdown
                      value={currentProjectDetails.priority || "none"}
                      onChange={(val) => handlePriorityUpdate(val as TProjectPriority)}
                      buttonVariant="transparent-with-text"
                      buttonClassName="!px-2 !py-1 text-sm"
                      buttonContainerClassName="w-auto"
                      highlightUrgent={false}
                    />
                  </div>

                  {/* Lead */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Users className="h-3.5 w-3.5" />
                      <span>{t("project_overview.lead")}</span>
                    </div>
                    <MemberDropdown
                      value={projectLeadId ?? null}
                      onChange={(val: string | null) => handleLeadUpdate(val ?? undefined)}
                      projectId={projectId}
                      placeholder={t("none")}
                      buttonVariant="transparent-with-text"
                      buttonClassName="!px-2 !py-1 text-sm"
                      buttonContainerClassName="w-auto"
                      showUserDetails
                      multiple={false}
                    />
                  </div>

                  {/* Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Users className="h-3.5 w-3.5" />
                      <span>{t("project_overview.members")}</span>
                    </div>
                    <span className="text-sm text-tertiary">
                      {memberCount} {memberCount === 1 ? t("member") : t("members")}
                    </span>
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{t("project_overview.start_date")}</span>
                    </div>
                    <DateDropdown
                      value={currentProjectDetails.start_date || null}
                      onChange={handleStartDateUpdate}
                      placeholder={t("none")}
                      buttonVariant="transparent-with-text"
                      buttonClassName="!px-2 !py-1 text-sm"
                      buttonContainerClassName="w-auto"
                      maxDate={currentProjectDetails.target_date ? new Date(currentProjectDetails.target_date) : undefined}
                    />
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{t("project_overview.due_date")}</span>
                    </div>
                    <DateDropdown
                      value={currentProjectDetails.target_date || null}
                      onChange={handleTargetDateUpdate}
                      placeholder={t("none")}
                      buttonVariant="transparent-with-text"
                      buttonClassName="!px-2 !py-1 text-sm"
                      buttonContainerClassName="w-auto"
                      minDate={currentProjectDetails.start_date ? new Date(currentProjectDetails.start_date) : undefined}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "updates" && isProjectUpdatesEnabled && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-medium text-secondary">{t("project_overview.updates")}</h5>
                  <div className="flex items-center gap-2">
                    <Tooltip tooltipContent={t("refresh")}>
                      <button
                        type="button"
                        onClick={() => mutateUpdates()}
                        disabled={isUpdatesLoading}
                        className="p-1 rounded hover:bg-layer-2 text-tertiary hover:text-secondary transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", isUpdatesLoading && "animate-spin")} />
                      </button>
                    </Tooltip>
                    {!isCreatingUpdate && (
                      <button
                        type="button"
                        onClick={() => setIsCreatingUpdate(true)}
                        className="text-xs text-accent-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        {t("project_overview.add_update")}
                      </button>
                    )}
                  </div>
                </div>

                {/* Create new update form */}
                {isCreatingUpdate && (
                  <div className="mb-4 p-3 rounded-lg border border-subtle bg-surface-2">
                    <input
                      type="text"
                      value={newUpdateTitle}
                      onChange={(e) => setNewUpdateTitle(e.target.value)}
                      placeholder={t("project_overview.update_title_placeholder")}
                      className="w-full bg-transparent text-sm font-medium border-0 focus:outline-none focus:ring-0 p-0 mb-2"
                    />
                    <textarea
                      value={newUpdateDescription}
                      onChange={(e) => setNewUpdateDescription(e.target.value)}
                      placeholder={t("project_overview.update_description_placeholder")}
                      className="w-full bg-transparent text-xs text-secondary border-0 focus:outline-none focus:ring-0 p-0 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <select
                        value={newUpdateCategory}
                        onChange={(e) => setNewUpdateCategory(e.target.value as TProjectUpdateCategory)}
                        className="text-xs bg-transparent border border-subtle rounded px-2 py-1"
                      >
                        {PROJECT_UPDATE_CATEGORIES.map((cat) => (
                          <option key={cat.key} value={cat.key}>{cat.title}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingUpdate(false);
                            setNewUpdateTitle("");
                            setNewUpdateDescription("");
                            setNewUpdateCategory("general");
                          }}
                          className="text-xs text-secondary hover:text-primary"
                        >
                          {t("cancel")}
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateUpdate}
                          className="text-xs text-accent-primary hover:underline"
                        >
                          {t("create")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Updates list */}
                {projectUpdates && projectUpdates.length > 0 ? (
                  <div className="space-y-3">
                    {projectUpdates.map((update) => {
                      const categoryInfo = PROJECT_UPDATE_CATEGORIES.find((c) => c.key === update.category);
                      const isEditing = editingUpdateId === update.id;

                      if (isEditing) {
                        return (
                          <div key={update.id} className="p-3 rounded-lg border border-subtle bg-surface-2">
                            <input
                              type="text"
                              value={editingUpdateTitle}
                              onChange={(e) => setEditingUpdateTitle(e.target.value)}
                              placeholder={t("project_overview.update_title_placeholder")}
                              className="w-full bg-transparent text-sm font-medium border-0 focus:outline-none focus:ring-0 p-0 mb-2"
                            />
                            <textarea
                              value={editingUpdateDescription}
                              onChange={(e) => setEditingUpdateDescription(e.target.value)}
                              placeholder={t("project_overview.update_description_placeholder")}
                              className="w-full bg-transparent text-xs text-secondary border-0 focus:outline-none focus:ring-0 p-0 resize-none"
                              rows={3}
                            />
                            <div className="flex items-center justify-between mt-3">
                              <select
                                value={editingUpdateCategory}
                                onChange={(e) => setEditingUpdateCategory(e.target.value as TProjectUpdateCategory)}
                                className="text-xs bg-transparent border border-subtle rounded px-2 py-1"
                              >
                                {PROJECT_UPDATE_CATEGORIES.map((cat) => (
                                  <option key={cat.key} value={cat.key}>{cat.title}</option>
                                ))}
                              </select>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditingUpdate}
                                  className="text-xs text-secondary hover:text-primary"
                                >
                                  {t("cancel")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditUpdate(update.id)}
                                  className="text-xs text-accent-primary hover:underline"
                                >
                                  {t("save")}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={update.id} className="p-3 rounded-lg border border-subtle hover:bg-layer-2 transition-colors group">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: categoryInfo?.color || "#6366f1" }}
                                />
                                <span className="text-xs text-tertiary">{categoryInfo?.title || "General"}</span>
                              </div>
                              <h6 className="text-sm font-medium text-primary truncate">{update.title}</h6>
                              {update.description && (
                                <p className="text-xs text-secondary mt-1 line-clamp-2">{update.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-tertiary">
                                {update.created_by_detail && (
                                  <span>{update.created_by_detail.display_name}</span>
                                )}
                                <span>•</span>
                                <span>{calculateTimeAgo(update.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip tooltipContent={t("edit")}>
                                <button
                                  type="button"
                                  onClick={() => startEditingUpdate(update)}
                                  className="p-1 rounded hover:bg-layer-3"
                                >
                                  <Edit3 className="h-3 w-3 text-tertiary" />
                                </button>
                              </Tooltip>
                              <Tooltip tooltipContent={t("delete")}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUpdate(update.id)}
                                  className="p-1 rounded hover:bg-layer-3"
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : isUpdatesLoading ? (
                  <Loader className="space-y-3">
                    <Loader.Item height="60px" />
                    <Loader.Item height="60px" />
                  </Loader>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 mx-auto text-tertiary mb-2" />
                    <p className="text-sm text-secondary">{t("project_overview.no_updates")}</p>
                    <p className="text-xs text-tertiary mt-1">{t("project_overview.no_updates_description")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "links" && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-medium text-secondary">{t("links.sidebar_title")}</h5>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="text-xs text-accent-primary hover:underline"
                  >
                    {t("project_overview.add_link")}
                  </button>
                </div>
                {linkIds && linkIds.length > 0 ? (
                  <div className="space-y-2">
                    {linkIds.map((linkId) => {
                      const link = getLinkById(linkId);
                      if (!link) return null;
                      return (
                        <div
                          key={linkId}
                          className="flex items-center justify-between group p-2 rounded hover:bg-layer-2"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <Link2 className="h-3.5 w-3.5 shrink-0 text-tertiary" />
                            <span className="text-sm text-secondary truncate">
                              {link.title || link.url}
                            </span>
                            <ExternalLink className="h-3 w-3 shrink-0 text-tertiary opacity-0 group-hover:opacity-100" />
                          </a>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            <Tooltip tooltipContent={t("edit")}>
                              <button
                                type="button"
                                onClick={() => handleEditLink(link)}
                                className="p-1 rounded hover:bg-layer-3"
                              >
                                <Link2 className="h-3 w-3 text-tertiary" />
                              </button>
                            </Tooltip>
                            <Tooltip tooltipContent={t("delete")}>
                              <button
                                type="button"
                                onClick={() => handleDeleteLink(linkId)}
                                className="p-1 rounded hover:bg-layer-3"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-tertiary text-center py-4">{t("project_overview.no_links")}</p>
                )}

                {/* Attachments section */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs font-medium text-secondary">{t("attachments")}</h5>
                  </div>
                  {attachmentIds && attachmentIds.length > 0 ? (
                    <div className="space-y-2">
                      {attachmentIds.map((attachmentId) => {
                        const attachment = getAttachmentById(attachmentId);
                        if (!attachment) return null;
                        const fileName = attachment.attributes?.name || "Attachment";
                        const fileSize = attachment.attributes?.size ? convertBytesToSize(attachment.attributes.size) : "";
                        return (
                          <div
                            key={attachmentId}
                            className="flex items-center justify-between group p-2 rounded hover:bg-layer-2"
                          >
                            <a
                              href={attachment.asset_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 flex-1 min-w-0"
                            >
                              <Paperclip className="h-3.5 w-3.5 shrink-0 text-tertiary" />
                              <div className="min-w-0">
                                <span className="text-sm text-secondary truncate block">{fileName}</span>
                                {fileSize && <span className="text-xs text-tertiary">{fileSize}</span>}
                              </div>
                            </a>
                            <Tooltip tooltipContent={t("delete")}>
                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(attachmentId)}
                                className="p-1 rounded hover:bg-layer-3 opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </button>
                            </Tooltip>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-tertiary text-center py-4">{t("project_overview.no_attachments")}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-medium text-secondary">
                    {t("project_overview.activity")}
                  </h5>
                  <Tooltip tooltipContent={t("refresh")}>
                    <button
                      type="button"
                      onClick={() => mutateActivity()}
                      disabled={isActivityLoading}
                      className="p-1 rounded hover:bg-layer-2 text-tertiary hover:text-secondary transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", isActivityLoading && "animate-spin")} />
                    </button>
                  </Tooltip>
                </div>
                {projectActivity ? (
                  projectActivity.results.length > 0 ? (
                    <div className="space-y-3">
                      {projectActivity.results.map((activity) => (
                        <div key={activity.id} className="flex gap-2">
                          <div className="flex-shrink-0 grid place-items-center overflow-hidden rounded-sm h-5 w-5 mt-0.5">
                            {activity.actor_detail?.avatar_url && activity.actor_detail?.avatar_url !== "" ? (
                              <img
                                src={getFileURL(activity.actor_detail?.avatar_url)}
                                alt={activity.actor_detail?.display_name}
                                className="rounded-sm h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-5 w-5 place-items-center rounded-sm bg-layer-3 text-[10px] text-secondary capitalize">
                                {activity.actor_detail?.display_name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-secondary break-words">
                              <span className="font-medium text-primary">
                                {currentUser?.id === activity.actor_detail?.id
                                  ? t("you")
                                  : activity.actor_detail?.display_name}{" "}
                              </span>
                              {activity.field ? (
                                <ActivityMessage activity={activity} showIssue />
                              ) : (
                                <span>
                                  {t("created")} <IssueLink activity={activity} />
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-tertiary mt-0.5">
                              {calculateTimeAgo(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-tertiary text-center py-4">{t("project_overview.no_activity")}</p>
                  )
                ) : (
                  <Loader className="space-y-3">
                    <Loader.Item height="32px" />
                    <Loader.Item height="32px" />
                    <Loader.Item height="32px" />
                  </Loader>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Modal */}
      <ProjectLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => toggleLinkModal(false)}
        linkOperations={linkOperations}
        preloadedData={linkData ? { id: linkData.id, title: linkData.title, url: linkData.url } : undefined}
      />
    </div>
  );
});
