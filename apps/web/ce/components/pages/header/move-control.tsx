"use client";

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { FileOutput } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { Tooltip } from "@plane/propel/tooltip";
// plane web hooks
import { usePageFlag } from "@/plane-web/hooks/use-page-flag";
// store
import type { TPageInstance } from "@/store/pages/base-page";
// local imports
import { MovePageModal } from "../modals/move-page-modal";

export type TPageMoveControlProps = {
  page: TPageInstance;
};

export const PageMoveControl = observer(function PageMoveControl({ page }: TPageMoveControlProps) {
  // params
  const { workspaceSlug } = useParams();
  // hooks
  const { t } = useTranslation();
  const { isMovePageEnabled } = usePageFlag({
    workspaceSlug: workspaceSlug?.toString() ?? "",
  });
  // states
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // derived values
  const { canCurrentUserMovePage } = page;

  if (!canCurrentUserMovePage || !isMovePageEnabled) return null;

  return (
    <>
      <Tooltip tooltipContent={t("project_page.move.tooltip")} position="bottom">
        <button
          type="button"
          onClick={() => setIsMoveModalOpen(true)}
          className="flex-shrink-0 size-6 grid place-items-center rounded-sm text-secondary hover:text-primary hover:bg-layer-1 transition-colors"
          aria-label={t("project_page.move.tooltip")}
        >
          <FileOutput className="size-3.5" />
        </button>
      </Tooltip>
      <MovePageModal isOpen={isMoveModalOpen} onClose={() => setIsMoveModalOpen(false)} page={page} />
    </>
  );
});
