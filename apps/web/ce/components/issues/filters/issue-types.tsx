import { useMemo, useState } from "react";
import { sortBy } from "lodash-es";
import { observer } from "mobx-react";
// plane imports
import { Loader } from "@plane/ui";
// components
import { FilterHeader, FilterOption } from "@/components/issues/issue-layouts/filters";
// hooks
import { useIssueType } from "@/hooks/store/use-issue-type";

type Props = {
  appliedFilters: string[] | null;
  handleUpdate: (val: string) => void;
  searchQuery: string;
};

export const FilterIssueTypes = observer(function FilterIssueTypes(props: Props) {
  const { appliedFilters, handleUpdate, searchQuery } = props;
  // store hooks
  const { workspaceIssueTypes } = useIssueType();
  // state
  const [itemsToRender, setItemsToRender] = useState(5);
  const [previewEnabled, setPreviewEnabled] = useState(true);

  const appliedFiltersCount = appliedFilters?.length ?? 0;

  const sortedOptions = useMemo(() => {
    const filteredOptions = (workspaceIssueTypes || []).filter((issueType) =>
      issueType.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return sortBy(filteredOptions, [
      (issueType) => !(appliedFilters ?? []).includes(issueType.id),
      (issueType) => issueType.name.toLowerCase(),
    ]);
  }, [workspaceIssueTypes, searchQuery, appliedFilters]);

  const handleViewToggle = () => {
    if (!sortedOptions) return;

    if (itemsToRender === sortedOptions.length) setItemsToRender(5);
    else setItemsToRender(sortedOptions.length);
  };

  const renderIcon = (logoProps: { in_use?: string; icon?: { name: string; color: string }; emoji?: { value: string } }) => {
    if (logoProps.in_use === "emoji" && logoProps.emoji?.value) {
      return <span className="text-sm">{logoProps.emoji.value}</span>;
    }
    if (logoProps.in_use === "icon" && logoProps.icon?.name) {
      return (
        <span
          className="material-symbols-rounded text-sm"
          style={{ color: logoProps.icon.color }}
        >
          {logoProps.icon.name}
        </span>
      );
    }
    return <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />;
  };

  return (
    <>
      <FilterHeader
        title={`Type${appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : ""}`}
        isPreviewEnabled={previewEnabled}
        handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
      />
      {previewEnabled && (
        <div>
          {sortedOptions ? (
            sortedOptions.length > 0 ? (
              <>
                {sortedOptions.slice(0, itemsToRender).map((issueType) => (
                  <FilterOption
                    key={issueType.id}
                    isChecked={appliedFilters?.includes(issueType.id) ? true : false}
                    onClick={() => handleUpdate(issueType.id)}
                    icon={renderIcon(issueType.logo_props)}
                    title={issueType.name}
                  />
                ))}
                {sortedOptions.length > 5 && (
                  <button
                    type="button"
                    className="ml-8 text-11 font-medium text-accent-primary"
                    onClick={handleViewToggle}
                  >
                    {itemsToRender === sortedOptions.length ? "View less" : "View all"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-11 italic text-placeholder">No matches found</p>
            )
          ) : (
            <Loader className="space-y-2">
              <Loader.Item height="20px" />
              <Loader.Item height="20px" />
              <Loader.Item height="20px" />
            </Loader>
          )}
        </div>
      )}
    </>
  );
});
