import type { CoreRootStore } from "../root.store";
import type { IProjectAttachmentStore } from "./project-attachment.store";
import { ProjectAttachmentStore } from "./project-attachment.store";
import type { IProjectLinkStore } from "./project-link.store";
import { ProjectLinkStore } from "./project-link.store";
import type { IProjectPublishStore } from "./project-publish.store";
import { ProjectPublishStore } from "./project-publish.store";
import type { IProjectStore } from "./project.store";
import { ProjectStore } from "./project.store";
import type { IProjectFilterStore } from "./project_filter.store";
import { ProjectFilterStore } from "./project_filter.store";

export interface IProjectRootStore {
  project: IProjectStore;
  projectFilter: IProjectFilterStore;
  publish: IProjectPublishStore;
  link: IProjectLinkStore;
  attachment: IProjectAttachmentStore;
}

export class ProjectRootStore {
  project: IProjectStore;
  projectFilter: IProjectFilterStore;
  publish: IProjectPublishStore;
  link: IProjectLinkStore;
  attachment: IProjectAttachmentStore;

  constructor(_root: CoreRootStore) {
    this.project = new ProjectStore(_root);
    this.projectFilter = new ProjectFilterStore(_root);
    this.publish = new ProjectPublishStore(this);
    this.link = new ProjectLinkStore();
    this.attachment = new ProjectAttachmentStore();
  }
}
