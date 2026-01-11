import { useRef, useState, useMemo } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import { observer } from "mobx-react";
import { usePopper } from "react-popper";
import { Combobox } from "@headlessui/react";
// plane imports
import type { EditorRefApi } from "@plane/editor";
import { useTranslation } from "@plane/i18n";
import { SearchIcon, ChevronDownIcon, CheckIcon } from "@plane/propel/icons";
import type { TBulkIssueProperties, TIssue } from "@plane/types";
import { ComboDropDown } from "@plane/ui";
import { cn } from "@plane/utils";
// components
import { DropdownButton } from "@/components/dropdowns/buttons";
// hooks
import { useIssueType } from "@/hooks/store/use-issue-type";
import { useDropdown } from "@/hooks/use-dropdown";

export type TIssueFields = TIssue & TBulkIssueProperties;

export type TIssueTypeDropdownVariant = "xs" | "sm";

export type TIssueTypeSelectProps<T extends FieldValues> = {
  control: Control<T>;
  projectId: string | null;
  editorRef?: React.MutableRefObject<EditorRefApi | null>;
  disabled?: boolean;
  variant?: TIssueTypeDropdownVariant;
  placeholder?: string;
  isRequired?: boolean;
  renderChevron?: boolean;
  dropDownContainerClassName?: string;
  showMandatoryFieldInfo?: boolean;
  handleFormChange?: () => void;
};

const IssueTypeIcon = ({
  logoProps,
}: {
  logoProps: { in_use?: string; icon?: { name: string; color: string }; emoji?: { value: string } };
}) => {
  if (logoProps.in_use === "emoji" && logoProps.emoji?.value) {
    return <span className="text-sm">{logoProps.emoji.value}</span>;
  }
  if (logoProps.in_use === "icon" && logoProps.icon?.name) {
    return (
      <span className="material-symbols-rounded text-sm" style={{ color: logoProps.icon.color }}>
        {logoProps.icon.name}
      </span>
    );
  }
  return <span className="h-3 w-3 rounded-full bg-gray-400" />;
};

export const IssueTypeSelect = observer(function IssueTypeSelect<T extends FieldValues>(
  props: TIssueTypeSelectProps<T>
) {
  const {
    control,
    projectId,
    disabled = false,
    variant = "sm",
    placeholder,
    renderChevron = true,
    dropDownContainerClassName,
    handleFormChange,
  } = props;

  const { t } = useTranslation();
  const { workspaceIssueTypes, getIssueTypeById, getProjectDefaultIssueTypeId } = useIssueType();

  // Controller for form integration
  const { field } = useController({
    name: "type_id" as Path<T>,
    control,
  });

  // refs
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // popper-js refs
  const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  // states
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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

  // Get the selected issue type
  const selectedIssueType = useMemo(() => {
    if (field.value) return getIssueTypeById(field.value);
    if (projectId) {
      const defaultId = getProjectDefaultIssueTypeId(projectId);
      if (defaultId) return getIssueTypeById(defaultId);
    }
    return undefined;
  }, [field.value, projectId, getIssueTypeById, getProjectDefaultIssueTypeId]);

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    const options = workspaceIssueTypes || [];
    if (query === "") return options;
    return options.filter((issueType) => issueType.name.toLowerCase().includes(query.toLowerCase()));
  }, [workspaceIssueTypes, query]);

  const handleChange = (val: string) => {
    field.onChange(val);
    handleFormChange?.();
    handleClose();
  };

  // If no issue types, return empty
  if (!workspaceIssueTypes || workspaceIssueTypes.length === 0) {
    return null;
  }

  const comboButton = (
    <button
      ref={setReferenceElement}
      type="button"
      className={cn(
        "clickable block h-full max-w-full outline-none",
        {
          "cursor-not-allowed text-secondary": disabled,
          "cursor-pointer": !disabled,
        },
        dropDownContainerClassName
      )}
      onClick={handleOnClick}
      disabled={disabled}
    >
      <DropdownButton
        className={cn("gap-1.5", variant === "xs" ? "text-xs" : "text-sm")}
        isActive={isOpen}
        tooltipHeading={t("type")}
        tooltipContent={selectedIssueType?.name ?? placeholder ?? t("select_type")}
        showTooltip
        variant="border-with-text"
      >
        {selectedIssueType ? (
          <>
            <IssueTypeIcon logoProps={selectedIssueType.logo_props} />
            <span className="flex-grow truncate text-left">{selectedIssueType.name}</span>
          </>
        ) : (
          <span className="text-placeholder">{placeholder ?? t("select_type")}</span>
        )}
        {renderChevron && <ChevronDownIcon className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />}
      </DropdownButton>
    </button>
  );

  return (
    <ComboDropDown
      as="div"
      ref={dropdownRef}
      className="h-full"
      value={field.value}
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
                      cn("flex w-full cursor-pointer select-none items-center gap-2 truncate rounded-sm px-1 py-1.5", {
                        "bg-layer-transparent-hover": active,
                        "bg-accent-primary/10": selected,
                      })
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
  );
}) as <T extends FieldValues>(props: TIssueTypeSelectProps<T>) => JSX.Element | null;
