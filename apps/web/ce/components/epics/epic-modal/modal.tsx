import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import type { TIssue } from "@plane/types";
import { EIssuesStoreType } from "@plane/types";
// components
import { CreateUpdateIssueModal } from "@/components/issues/issue-modal/modal";

export interface EpicModalProps {
  data?: Partial<TIssue>;
  isOpen: boolean;
  onClose: () => void;
  beforeFormSubmit?: () => Promise<void>;
  onSubmit?: (res: TIssue) => Promise<void>;
  fetchIssueDetails?: boolean;
  primaryButtonText?: {
    default: string;
    loading: string;
  };
  isProjectSelectionDisabled?: boolean;
}

export const CreateUpdateEpicModal = observer(function CreateUpdateEpicModal(props: EpicModalProps) {
  const { data, isOpen, onClose, beforeFormSubmit, onSubmit, fetchIssueDetails, primaryButtonText, isProjectSelectionDisabled } = props;
  const { projectId } = useParams();

  // Merge data with is_epic flag
  const epicData: Partial<TIssue> = {
    ...data,
    is_epic: true,
    project_id: data?.project_id ?? projectId?.toString() ?? null,
  };

  return (
    <CreateUpdateIssueModal
      data={epicData}
      isOpen={isOpen}
      onClose={onClose}
      beforeFormSubmit={beforeFormSubmit}
      onSubmit={onSubmit}
      fetchIssueDetails={fetchIssueDetails}
      primaryButtonText={primaryButtonText ?? { default: "Create Epic", loading: "Creating Epic..." }}
      isProjectSelectionDisabled={isProjectSelectionDisabled}
      storeType={EIssuesStoreType.EPIC}
      modalTitle={data?.id ? "Update Epic" : "Create Epic"}
    />
  );
});
