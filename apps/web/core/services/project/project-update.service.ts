import { API_BASE_URL } from "@plane/constants";
// types
import type { IProjectUpdate, TProjectUpdateCategory } from "@plane/types";
// services
import { APIService } from "@/services/api.service";

export class ProjectUpdateService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async fetchUpdates(
    workspaceSlug: string,
    projectId: string,
    category?: TProjectUpdateCategory
  ): Promise<IProjectUpdate[]> {
    const params = category ? `?category=${category}` : "";
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/updates/${params}`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async createUpdate(workspaceSlug: string, projectId: string, data: Partial<IProjectUpdate>): Promise<IProjectUpdate> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/updates/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async updateUpdate(
    workspaceSlug: string,
    projectId: string,
    updateId: string,
    data: Partial<IProjectUpdate>
  ): Promise<IProjectUpdate> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/updates/${updateId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async deleteUpdate(workspaceSlug: string, projectId: string, updateId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/updates/${updateId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
