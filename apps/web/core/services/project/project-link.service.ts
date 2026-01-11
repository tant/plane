import { API_BASE_URL } from "@plane/constants";
// types
import type { TProjectLink } from "@plane/types";
// services
import { APIService } from "@/services/api.service";

export class ProjectLinkService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetchLinks(workspaceSlug: string, projectId: string): Promise<TProjectLink[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createLink(workspaceSlug: string, projectId: string, data: Partial<TProjectLink>): Promise<TProjectLink> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async updateLink(
    workspaceSlug: string,
    projectId: string,
    linkId: string,
    data: Partial<TProjectLink>
  ): Promise<TProjectLink> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/${linkId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async deleteLink(workspaceSlug: string, projectId: string, linkId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/${linkId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
