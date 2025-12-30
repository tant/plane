import { set } from "lodash-es";
import { action, makeObservable, observable, runInAction } from "mobx";
// types
import type { TProjectLink, TProjectLinkEditableFields, TProjectLinkIdMap, TProjectLinkMap } from "@plane/types";
// services
import { ProjectLinkService } from "@/services/project";

export interface IProjectLinkStoreActions {
  fetchLinks: (workspaceSlug: string, projectId: string) => Promise<TProjectLink[]>;
  createLink: (workspaceSlug: string, projectId: string, data: TProjectLinkEditableFields) => Promise<TProjectLink>;
  updateLink: (
    workspaceSlug: string,
    projectId: string,
    linkId: string,
    data: Partial<TProjectLinkEditableFields>
  ) => Promise<TProjectLink>;
  deleteLink: (workspaceSlug: string, projectId: string, linkId: string) => Promise<void>;
  setLinkData: (link: TProjectLink | undefined) => void;
  toggleLinkModal: (isOpen: boolean) => void;
}

export interface IProjectLinkStore extends IProjectLinkStoreActions {
  // observables
  links: TProjectLinkIdMap;
  linkMap: TProjectLinkMap;
  linkData: TProjectLink | undefined;
  isLinkModalOpen: boolean;
  // helper methods
  getLinksByProjectId: (projectId: string) => string[] | undefined;
  getLinkById: (linkId: string) => TProjectLink | undefined;
}

export class ProjectLinkStore implements IProjectLinkStore {
  // observables
  links: TProjectLinkIdMap = {};
  linkMap: TProjectLinkMap = {};
  linkData: TProjectLink | undefined = undefined;
  isLinkModalOpen = false;
  // services
  projectLinkService: ProjectLinkService;

  constructor() {
    makeObservable(this, {
      // observables
      links: observable,
      linkMap: observable,
      linkData: observable,
      isLinkModalOpen: observable,
      // actions
      fetchLinks: action,
      createLink: action,
      updateLink: action,
      deleteLink: action,
      setLinkData: action,
      toggleLinkModal: action,
    });
    // services
    this.projectLinkService = new ProjectLinkService();
  }

  // helper methods
  getLinksByProjectId = (projectId: string) => {
    if (!projectId) return undefined;
    return this.links[projectId] ?? undefined;
  };

  getLinkById = (linkId: string) => {
    if (!linkId) return undefined;
    return this.linkMap[linkId] ?? undefined;
  };

  // actions
  setLinkData = (link: TProjectLink | undefined) => {
    runInAction(() => {
      this.linkData = link;
    });
  };

  toggleLinkModal = (isOpen: boolean) => {
    runInAction(() => {
      this.isLinkModalOpen = isOpen;
      if (!isOpen) {
        this.linkData = undefined;
      }
    });
  };

  fetchLinks = async (workspaceSlug: string, projectId: string) => {
    const response = await this.projectLinkService.fetchLinks(workspaceSlug, projectId);
    runInAction(() => {
      this.links[projectId] = response.map((link) => link.id);
      response.forEach((link) => set(this.linkMap, link.id, link));
    });
    return response;
  };

  createLink = async (workspaceSlug: string, projectId: string, data: TProjectLinkEditableFields) => {
    const response = await this.projectLinkService.createLink(workspaceSlug, projectId, data);
    runInAction(() => {
      this.links[projectId] = [response.id, ...(this.links[projectId] ?? [])];
      set(this.linkMap, response.id, response);
    });
    return response;
  };

  updateLink = async (
    workspaceSlug: string,
    projectId: string,
    linkId: string,
    data: Partial<TProjectLinkEditableFields>
  ) => {
    // Optimistic update
    runInAction(() => {
      Object.keys(data).forEach((key) => {
        set(this.linkMap, [linkId, key], data[key as keyof TProjectLinkEditableFields]);
      });
    });

    const response = await this.projectLinkService.updateLink(workspaceSlug, projectId, linkId, data);
    return response;
  };

  deleteLink = async (workspaceSlug: string, projectId: string, linkId: string) => {
    await this.projectLinkService.deleteLink(workspaceSlug, projectId, linkId);

    const linkIndex = this.links[projectId]?.findIndex((link) => link === linkId);
    if (linkIndex !== undefined && linkIndex >= 0) {
      runInAction(() => {
        this.links[projectId].splice(linkIndex, 1);
        delete this.linkMap[linkId];
      });
    }
  };
}
