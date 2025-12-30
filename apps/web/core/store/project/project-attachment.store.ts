import type { AxiosRequestConfig } from "axios";
import { set } from "lodash-es";
import { action, makeObservable, observable, runInAction } from "mobx";
// types
import type { TProjectAttachment, TProjectAttachmentIdMap, TProjectAttachmentMap } from "@plane/types";
// services
import { ProjectAttachmentService } from "@/services/project";

export interface IProjectAttachmentStoreActions {
  fetchAttachments: (workspaceSlug: string, projectId: string) => Promise<TProjectAttachment[]>;
  uploadAttachment: (
    workspaceSlug: string,
    projectId: string,
    file: File,
    uploadProgressHandler?: AxiosRequestConfig["onUploadProgress"]
  ) => Promise<TProjectAttachment>;
  deleteAttachment: (workspaceSlug: string, projectId: string, attachmentId: string) => Promise<void>;
}

export interface IProjectAttachmentStore extends IProjectAttachmentStoreActions {
  // observables
  attachments: TProjectAttachmentIdMap;
  attachmentMap: TProjectAttachmentMap;
  // helper methods
  getAttachmentsByProjectId: (projectId: string) => string[] | undefined;
  getAttachmentById: (attachmentId: string) => TProjectAttachment | undefined;
}

export class ProjectAttachmentStore implements IProjectAttachmentStore {
  // observables
  attachments: TProjectAttachmentIdMap = {};
  attachmentMap: TProjectAttachmentMap = {};
  // services
  projectAttachmentService: ProjectAttachmentService;

  constructor() {
    makeObservable(this, {
      // observables
      attachments: observable,
      attachmentMap: observable,
      // actions
      fetchAttachments: action,
      uploadAttachment: action,
      deleteAttachment: action,
    });
    // services
    this.projectAttachmentService = new ProjectAttachmentService();
  }

  // helper methods
  getAttachmentsByProjectId = (projectId: string) => {
    if (!projectId) return undefined;
    return this.attachments[projectId] ?? undefined;
  };

  getAttachmentById = (attachmentId: string) => {
    if (!attachmentId) return undefined;
    return this.attachmentMap[attachmentId] ?? undefined;
  };

  // actions
  fetchAttachments = async (workspaceSlug: string, projectId: string) => {
    const response = await this.projectAttachmentService.getProjectAttachments(workspaceSlug, projectId);
    runInAction(() => {
      this.attachments[projectId] = response.map((attachment) => attachment.id);
      response.forEach((attachment) => set(this.attachmentMap, attachment.id, attachment));
    });
    return response;
  };

  uploadAttachment = async (
    workspaceSlug: string,
    projectId: string,
    file: File,
    uploadProgressHandler?: AxiosRequestConfig["onUploadProgress"]
  ) => {
    const response = await this.projectAttachmentService.uploadProjectAttachment(
      workspaceSlug,
      projectId,
      file,
      uploadProgressHandler
    );
    runInAction(() => {
      this.attachments[projectId] = [response.id, ...(this.attachments[projectId] ?? [])];
      set(this.attachmentMap, response.id, response);
    });
    return response;
  };

  deleteAttachment = async (workspaceSlug: string, projectId: string, attachmentId: string) => {
    await this.projectAttachmentService.deleteProjectAttachment(workspaceSlug, projectId, attachmentId);

    const attachmentIndex = this.attachments[projectId]?.findIndex((id) => id === attachmentId);
    if (attachmentIndex !== undefined && attachmentIndex >= 0) {
      runInAction(() => {
        this.attachments[projectId].splice(attachmentIndex, 1);
        delete this.attachmentMap[attachmentId];
      });
    }
  };
}
