import { observer } from "mobx-react";
// icons
import { CloseIcon } from "@plane/propel/icons";
// hooks
import { useIssueType } from "@/hooks/store/use-issue-type";

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
  editable: boolean | undefined;
};

export const AppliedIssueTypeFilters = observer(function AppliedIssueTypeFilters(props: Props) {
  const { handleRemove, values, editable } = props;
  // store hooks
  const { getIssueTypeById } = useIssueType();

  const renderIcon = (logoProps: { in_use?: string; icon?: { name: string; color: string }; emoji?: { value: string } }) => {
    if (logoProps.in_use === "emoji" && logoProps.emoji?.value) {
      return <span className="text-xs">{logoProps.emoji.value}</span>;
    }
    if (logoProps.in_use === "icon" && logoProps.icon?.name) {
      return (
        <span
          className="material-symbols-rounded text-xs"
          style={{ color: logoProps.icon.color }}
        >
          {logoProps.icon.name}
        </span>
      );
    }
    return <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />;
  };

  return (
    <>
      {values.map((issueTypeId) => {
        const issueTypeDetails = getIssueTypeById(issueTypeId);

        if (!issueTypeDetails) return null;

        return (
          <div key={issueTypeId} className="flex items-center gap-1 rounded-sm bg-layer-1 p-1 text-11">
            {renderIcon(issueTypeDetails.logo_props)}
            <span className="normal-case">{issueTypeDetails.name}</span>
            {editable && (
              <button
                type="button"
                className="grid place-items-center text-tertiary hover:text-secondary"
                onClick={() => handleRemove(issueTypeId)}
              >
                <CloseIcon height={10} width={10} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
});
