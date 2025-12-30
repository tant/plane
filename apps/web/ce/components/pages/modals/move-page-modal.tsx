"use client";

import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Combobox } from "@headlessui/react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { SearchIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { EModalPosition, EModalWidth, ModalCore } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
// services
import { ProjectPageService } from "@/services/page";
// store types
import type { TPageInstance } from "@/store/pages/base-page";

const projectPageService = new ProjectPageService();

export type TMovePageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  page: TPageInstance;
};

export const MovePageModal = observer(function MovePageModal(props: TMovePageModalProps) {
  const { isOpen, onClose, page } = props;
  // router
  const router = useAppRouter();
  // params
  const { workspaceSlug } = useParams();
  // hooks
  const { t } = useTranslation();
  const { workspaceProjectIds, getProjectById } = useProject();
  // states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // derived values
  const currentProjectId = page.project_ids?.[0];
  const pageId = page.id;

  // Filter projects - exclude current project and archived projects
  const availableProjectIds = useMemo(() => {
    if (!workspaceProjectIds) return [];
    return workspaceProjectIds.filter((id) => {
      if (id === currentProjectId) return false;
      const project = getProjectById(id);
      if (!project || project.archived_at) return false;
      return true;
    });
  }, [workspaceProjectIds, currentProjectId, getProjectById]);

  // Filter by search term
  const filteredProjectIds = useMemo(() => {
    if (!searchTerm.trim()) return availableProjectIds;
    return availableProjectIds.filter((id) => {
      const project = getProjectById(id);
      if (!project) return false;
      const projectQuery = `${project.identifier} ${project.name}`.toLowerCase();
      return projectQuery.includes(searchTerm.toLowerCase());
    });
  }, [availableProjectIds, searchTerm, getProjectById]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSearchTerm("");
      setSelectedProjectId(null);
    }, 300);
  };

  const handleMove = async () => {
    if (!workspaceSlug || !currentProjectId || !pageId || !selectedProjectId) return;

    try {
      setIsSubmitting(true);
      await projectPageService.move(
        workspaceSlug.toString(),
        currentProjectId,
        pageId,
        selectedProjectId
      );

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: t("success"),
        message: t("project_page.move.success"),
      });

      // Redirect to new page location
      router.push(`/${workspaceSlug}/projects/${selectedProjectId}/pages/${pageId}`);
      handleClose();
    } catch (error) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: t("error"),
        message: t("project_page.move.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <ModalCore isOpen={isOpen} position={EModalPosition.TOP} width={EModalWidth.LG} handleClose={handleClose}>
      <Combobox as="div" value={selectedProjectId} onChange={handleSelectProject}>
        <div className="flex items-center gap-2 px-4 border-b border-subtle">
          <SearchIcon className="flex-shrink-0 size-4 text-placeholder" aria-hidden="true" />
          <Combobox.Input
            className="h-12 w-full border-0 bg-transparent text-13 text-primary outline-none placeholder:text-placeholder focus:ring-0"
            placeholder={t("project_page.move.search_placeholder")}
            displayValue={() => ""}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Combobox.Options
          static
          className="py-2 vertical-scrollbar scrollbar-md max-h-80 scroll-py-2 overflow-y-auto"
        >
          {filteredProjectIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-3 py-8 text-center">
              <p className="text-sm text-tertiary">{t("project_page.move.no_projects")}</p>
            </div>
          ) : (
            <ul className="px-2">
              {filteredProjectIds.map((projectId) => {
                const project = getProjectById(projectId);
                if (!project) return null;
                const isSelected = selectedProjectId === projectId;
                return (
                  <Combobox.Option
                    key={projectId}
                    value={projectId}
                    className={({ active }) =>
                      cn(
                        "flex items-center gap-2 truncate w-full cursor-pointer select-none rounded-md p-2 text-secondary transition-colors",
                        {
                          "bg-layer-1": active || isSelected,
                          "text-primary": isSelected,
                        }
                      )
                    }
                  >
                    <Logo logo={project.logo_props} size={16} />
                    <p className="text-13 truncate">{project.name}</p>
                  </Combobox.Option>
                );
              })}
            </ul>
          )}
        </Combobox.Options>
      </Combobox>
      <div className="flex items-center justify-end gap-2 p-3 border-t border-subtle">
        <Button variant="secondary" size="lg" onClick={handleClose} disabled={isSubmitting}>
          {t("cancel")}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleMove}
          loading={isSubmitting}
          disabled={!selectedProjectId || isSubmitting}
        >
          {t("project_page.move.button")}
        </Button>
      </div>
    </ModalCore>
  );
});
