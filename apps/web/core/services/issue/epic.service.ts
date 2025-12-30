// plane imports
import { EIssueServiceType } from "@plane/types";
// services
import { IssueService } from "./issue.service";

export class EpicService extends IssueService {
  constructor() {
    super(EIssueServiceType.EPICS);
  }

  async getEpicMetaFromURL(
    workspaceSlug: string,
    projectId: string,
    epicId: string
  ): Promise<{ project_identifier: string; sequence_id: string } | null> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/epics/${epicId}/meta/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
