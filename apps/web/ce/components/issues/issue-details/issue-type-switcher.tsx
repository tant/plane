import { useRef, useState, useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { usePopper } from "react-popper";
import { Combobox } from "@headlessui/react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { SearchIcon, ChevronDownIcon, CheckIcon } from "@plane/propel/icons";
import { ComboDropDown } from "@plane/ui";
import { cn } from "@plane/utils";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useIssueType } from "@/hooks/store/use-issue-type";
import { useDropdown } from "@/hooks/use-dropdown";
// plane web components
import { IssueIdentifier } from "@/plane-web/components/issues/issue-details/issue-identifier";

export type TIssueTypeSwitcherProps = {
  issueId: string;
  disabled: boolean;
};

const IssueTypeIcon = ({ logoProps }: { logoProps: { in_use?: string; icon?: { name: string; color: string }; emoji?: { value: string } } }) => {
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
  return <span className="h-3 w-3 rounded-full bg-gray-400" />;
};

export const IssueTypeSwitcher = observer(function IssueTypeSwitcher(props: TIssueTypeSwitcherProps) {
  const { issueId, disabled } = props;
  const { t } = useTranslation();
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const {
    issue: { getIssueById, updateIssue },
  } = useIssueDetail();
  const { workspaceIssueTypes, getIssueTypeById } = useIssueType();

  // refs
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  // states
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // derived values
  const issue = getIssueById(issueId);
  const currentIssueType = issue?.type_id ? getIssueTypeById(issue.type_id) : undefined;

  // popper-js init
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "bottom-start",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          padding: 12,
        },
      },
    ],
  });

  // dropdown init
  const { handleClose, handleKeyDown, handleOnClick, searchInputKeyDown } = useDropdown({
    dropdownRef,
    inputRef,
    isOpen,
    onClose: () => {},
    query,
    setIsOpen,
    setQuery,
  });

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    const options = workspaceIssueTypes || [];
    if (query === "") return options;
    return options.filter((issueType) =>
      issueType.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [workspaceIssueTypes, query]);

  const handleChange = (val: string) => {
    if (!issue?.project_id || !workspaceSlug) return;
    void updateIssue(workspaceSlug.toString(), issue.project_id, issueId, { type_id: val });
    handleClose();
  };

  if (!issue || !issue.project_id) return <></>;

  // If no issue types, just show the identifier
  if (!workspaceIssueTypes || workspaceIssueTypes.length === 0) {
    return <IssueIdentifier issueId={issueId} projectId={issue.project_id} size="md" enableClickToCopyIdentifier />;
  }

  const comboButton = (
    <button
      ref={setReferenceElement}
      type="button"
      className={cn(
        "flex items-center gap-1.5 rounded px-2 py-1 hover:bg-layer-transparent-hover",
        {
          "cursor-not-allowed opacity-50": disabled,
          "cursor-pointer": !disabled,
        }
      )}
      onClick={handleOnClick}
      disabled={disabled}
    >
      {currentIssueType ? (
        <>
          <IssueTypeIcon logoProps={currentIssueType.logo_props} />
          <span className="text-sm font-medium">{currentIssueType.name}</span>
        </>
      ) : (
        <span className="text-sm text-placeholder">{t("select_type")}</span>
      )}
      {!disabled && <ChevronDownIcon className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />}
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <ComboDropDown
        as="div"
        ref={dropdownRef}
        value={issue.type_id}
        onChange={handleChange}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        button={comboButton}
      >
        {isOpen && (
          <Combobox.Options className="fixed z-10" static>
            <div
              className="my-1 w-48 rounded-sm border-[0.5px] border-strong bg-surface-1 px-2 py-2.5 text-11 shadow-raised-200 focus:outline-none"
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              <div className="flex items-center gap-1.5 rounded-sm border border-subtle bg-surface-2 px-2">
                <SearchIcon className="h-3.5 w-3.5 text-placeholder" strokeWidth={1.5} />
                <Combobox.Input
                  as="input"
                  ref={inputRef}
                  className="w-full bg-transparent py-1 text-11 text-secondary placeholder:text-placeholder focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("common.search.label")}
                  onKeyDown={searchInputKeyDown}
                />
              </div>
              <div className="mt-2 max-h-48 space-y-1 overflow-y-scroll">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((issueType) => (
                    <Combobox.Option
                      key={issueType.id}
                      value={issueType.id}
                      className={({ active, selected }) =>
                        cn(
                          "flex w-full cursor-pointer select-none items-center gap-2 truncate rounded-sm px-1 py-1.5",
                          {
                            "bg-layer-transparent-hover": active,
                            "bg-accent-primary/10": selected,
                          }
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <IssueTypeIcon logoProps={issueType.logo_props} />
                          <span className="flex-grow truncate">{issueType.name}</span>
                          {selected && <CheckIcon className="h-3 w-3 flex-shrink-0 text-accent-primary" />}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                ) : (
                  <p className="px-1.5 py-1 italic text-placeholder">{t("no_matching_results")}</p>
                )}
              </div>
            </div>
          </Combobox.Options>
        )}
      </ComboDropDown>
      <IssueIdentifier issueId={issueId} projectId={issue.project_id} size="md" enableClickToCopyIdentifier />
    </div>
  );
});
