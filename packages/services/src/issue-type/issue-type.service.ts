import { API_BASE_URL } from "@plane/constants";
import type { IIssueType, IProjectIssueType } from "@plane/types";
import { APIService } from "../api.service";

/**
 * Service class for managing issue type operations at workspace level
 * @extends {APIService}
 */
export class IssueTypeService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves all active issue types in a workspace (cached)
   */
  async list(workspaceSlug: string): Promise<IIssueType[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/issue-types/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Retrieves all issue types in a workspace (including inactive)
   */
  async listAll(workspaceSlug: string): Promise<IIssueType[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/issue-types/all/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Creates a new issue type in the workspace
   */
  async create(workspaceSlug: string, data: Partial<IIssueType>): Promise<IIssueType> {
    return this.post(`/api/workspaces/${workspaceSlug}/issue-types/all/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Retrieves a specific issue type
   */
  async retrieve(workspaceSlug: string, issueTypeId: string): Promise<IIssueType> {
    return this.get(`/api/workspaces/${workspaceSlug}/issue-types/${issueTypeId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Updates an issue type
   */
  async update(workspaceSlug: string, issueTypeId: string, data: Partial<IIssueType>): Promise<IIssueType> {
    return this.patch(`/api/workspaces/${workspaceSlug}/issue-types/${issueTypeId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Deletes an issue type
   */
  async destroy(workspaceSlug: string, issueTypeId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/issue-types/${issueTypeId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

/**
 * Service class for managing project-specific issue type operations
 * @extends {APIService}
 */
export class ProjectIssueTypeService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves all issue types enabled for a project
   */
  async list(workspaceSlug: string, projectId: string): Promise<IProjectIssueType[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Adds an issue type to a project
   */
  async create(
    workspaceSlug: string,
    projectId: string,
    data: { issue_type_id: string }
  ): Promise<IProjectIssueType> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/all/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Updates a project issue type (e.g., set as default, change level)
   */
  async update(
    workspaceSlug: string,
    projectId: string,
    projectIssueTypeId: string,
    data: Partial<IProjectIssueType>
  ): Promise<IProjectIssueType> {
    return this.patch(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/${projectIssueTypeId}/`,
      data
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Removes an issue type from a project
   */
  async destroy(workspaceSlug: string, projectId: string, projectIssueTypeId: string): Promise<void> {
    return this.delete(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issue-types/${projectIssueTypeId}/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
