"use client";

import type { FC } from "react";
import { useRef } from "react";
import { observer } from "mobx-react";
import { Link2, Paperclip, FileText } from "lucide-react";
// plane imports
import { EIssueServiceType } from "@plane/types";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";

type TEpicActionButtonsProps = {
  workspaceSlug: string;
  projectId: string;
  epicId: string;
  disabled?: boolean;
};

export const EpicActionButtons: FC<TEpicActionButtonsProps> = observer((props) => {
  const { workspaceSlug, projectId, epicId, disabled = false } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // store hooks
  const {
    toggleIssueLinkModal,
    attachment: { createAttachment },
  } = useIssueDetail(EIssueServiceType.EPICS);

  const handleAddLink = () => {
    if (disabled) return;
    toggleIssueLinkModal(true);
  };

  const handleAttachClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    void createAttachment(workspaceSlug, projectId, epicId, file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLinkPages = () => {
    if (disabled) return;
    // Link pages functionality - placeholder for enterprise feature
  };

  const buttonClass =
    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded border border-custom-border-200 bg-custom-background-100 text-custom-text-200 hover:bg-custom-background-80 hover:text-custom-text-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button type="button" className={buttonClass} onClick={handleAddLink} disabled={disabled}>
        <Link2 className="h-3.5 w-3.5" />
        <span>Add link</span>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="*/*"
        disabled={disabled}
      />
      <button type="button" className={buttonClass} onClick={handleAttachClick} disabled={disabled}>
        <Paperclip className="h-3.5 w-3.5" />
        <span>Attach</span>
      </button>

      <button type="button" className={buttonClass} onClick={handleLinkPages} disabled={disabled}>
        <FileText className="h-3.5 w-3.5" />
        <span>Link pages</span>
      </button>
    </div>
  );
});
