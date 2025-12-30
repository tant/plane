import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
// types
import type { IProjectAttachmentStore } from "@/store/project/project-attachment.store";

export const useProjectAttachment = (): IProjectAttachmentStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useProjectAttachment must be used within StoreProvider");
  return context.projectRoot.attachment;
};
