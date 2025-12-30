import { observer } from "mobx-react";
import { MoreHorizontal } from "lucide-react";
// plane imports
import { IconButton } from "@plane/propel/icon-button";

type TEstimateListItem = {
  estimateId: string;
  isAdmin: boolean;
  isEstimateEnabled: boolean;
  isEditable: boolean;
  onEditClick?: (estimateId: string) => void;
  onDeleteClick?: (estimateId: string) => void;
};

export const EstimateListItemButtons = observer(function EstimateListItemButtons(props: TEstimateListItem) {
  const { estimateId, isAdmin, isEditable, onEditClick } = props;

  if (!isAdmin || !isEditable) return <></>;
  return (
    <div className="relative flex items-center gap-1">
      <IconButton
        variant="ghost"
        size="sm"
        icon={MoreHorizontal}
        onClick={() => onEditClick && onEditClick(estimateId)}
      />
    </div>
  );
});
