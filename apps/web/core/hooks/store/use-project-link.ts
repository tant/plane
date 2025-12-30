import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
// types
import type { IProjectLinkStore } from "@/store/project/project-link.store";

export const useProjectLink = (): IProjectLinkStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useProjectLink must be used within StoreProvider");
  return context.projectRoot.link;
};
