import { set } from "lodash-es";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
// plane imports
import type { IIssueType, IProjectIssueType } from "@plane/types";
// services
import { IssueTypeService, ProjectIssueTypeService } from "@plane/services";
// store
import type { RootStore } from "@/plane-web/store/root.store";

export interface IIssueTypeStore {
  // loaders
  fetchedMap: Record<string, boolean>;
  projectFetchedMap: Record<string, boolean>;
  // observables
  issueTypeMap: Record<string, IIssueType>;
  projectIssueTypeMap: Record<string, IProjectIssueType>;
  // computed
  workspaceIssueTypes: IIssueType[] | undefined;
  projectIssueTypes: IProjectIssueType[] | undefined;
  // computed actions
  getIssueTypeById: (issueTypeId: string | null | undefined) => IIssueType | undefined;
  getProjectIssueTypeById: (projectIssueTypeId: string | null | undefined) => IProjectIssueType | undefined;
  getProjectIssueTypes: (projectId: string | null | undefined) => IProjectIssueType[] | undefined;
  getProjectDefaultIssueTypeId: (projectId: string | null | undefined) => string | undefined;
  // fetch actions
  fetchWorkspaceIssueTypes: (workspaceSlug: string) => Promise<IIssueType[]>;
  fetchProjectIssueTypes: (workspaceSlug: string, projectId: string) => Promise<IProjectIssueType[]>;
  // workspace-level crud actions
  createIssueType: (workspaceSlug: string, data: Partial<IIssueType>) => Promise<IIssueType>;
  updateIssueType: (workspaceSlug: string, issueTypeId: string, data: Partial<IIssueType>) => Promise<IIssueType | undefined>;
  deleteIssueType: (workspaceSlug: string, issueTypeId: string) => Promise<void>;
  // project-level crud actions
  addIssueTypeToProject: (workspaceSlug: string, projectId: string, issueTypeId: string) => Promise<IProjectIssueType>;
  updateProjectIssueType: (
    workspaceSlug: string,
    projectId: string,
    projectIssueTypeId: string,
    data: Partial<IProjectIssueType>
  ) => Promise<IProjectIssueType | undefined>;
  removeIssueTypeFromProject: (workspaceSlug: string, projectId: string, projectIssueTypeId: string) => Promise<void>;
  setDefaultProjectIssueType: (workspaceSlug: string, projectId: string, projectIssueTypeId: string) => Promise<void>;
}

export class IssueTypeStore implements IIssueTypeStore {
  // observables
  issueTypeMap: Record<string, IIssueType> = {};
  projectIssueTypeMap: Record<string, IProjectIssueType> = {};
  // loaders
  fetchedMap: Record<string, boolean> = {};
  projectFetchedMap: Record<string, boolean> = {};
  // root store
  rootStore: RootStore;
  router;
  // services
  issueTypeService: IssueTypeService;
  projectIssueTypeService: ProjectIssueTypeService;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      // observables
      issueTypeMap: observable,
      projectIssueTypeMap: observable,
      fetchedMap: observable,
      projectFetchedMap: observable,
      // computed
      workspaceIssueTypes: computed,
      projectIssueTypes: computed,
      // fetch actions
      fetchWorkspaceIssueTypes: action,
      fetchProjectIssueTypes: action,
      // workspace crud actions
      createIssueType: action,
      updateIssueType: action,
      deleteIssueType: action,
      // project crud actions
      addIssueTypeToProject: action,
      updateProjectIssueType: action,
      removeIssueTypeFromProject: action,
      setDefaultProjectIssueType: action,
    });
    this.issueTypeService = new IssueTypeService();
    this.projectIssueTypeService = new ProjectIssueTypeService();
    this.router = _rootStore.router;
    this.rootStore = _rootStore;
  }

  /**
   * Returns the issue types for the current workspace
   */
  get workspaceIssueTypes() {
    const workspaceSlug = this.router.workspaceSlug || "";
    if (!workspaceSlug || !this.fetchedMap[workspaceSlug]) return undefined;
    return Object.values(this.issueTypeMap)
      .filter((issueType) => issueType.is_active)
      .sort((a, b) => a.level - b.level);
  }

  /**
   * Returns the project issue types for the current project
   */
  get projectIssueTypes() {
    const projectId = this.router.projectId;
    if (!projectId || !this.projectFetchedMap[projectId]) return undefined;
    return Object.values(this.projectIssueTypeMap)
      .filter((pit) => pit.project_id === projectId)
      .sort((a, b) => a.level - b.level);
  }

  /**
   * Returns issue type details by id
   */
  getIssueTypeById = computedFn((issueTypeId: string | null | undefined) => {
    if (!this.issueTypeMap || !issueTypeId) return undefined;
    return this.issueTypeMap[issueTypeId] ?? undefined;
  });

  /**
   * Returns project issue type details by id
   */
  getProjectIssueTypeById = computedFn((projectIssueTypeId: string | null | undefined) => {
    if (!this.projectIssueTypeMap || !projectIssueTypeId) return undefined;
    return this.projectIssueTypeMap[projectIssueTypeId] ?? undefined;
  });

  /**
   * Returns project issue types for a specific project
   */
  getProjectIssueTypes = computedFn((projectId: string | null | undefined) => {
    if (!projectId || !this.projectFetchedMap[projectId]) return undefined;
    return Object.values(this.projectIssueTypeMap)
      .filter((pit) => pit.project_id === projectId)
      .sort((a, b) => a.level - b.level);
  });

  /**
   * Returns the default issue type id for a project
   */
  getProjectDefaultIssueTypeId = computedFn((projectId: string | null | undefined) => {
    const projectIssueTypes = this.getProjectIssueTypes(projectId);
    return projectIssueTypes?.find((pit) => pit.is_default)?.issue_type_id;
  });

  /**
   * Fetches all issue types for a workspace
   */
  fetchWorkspaceIssueTypes = async (workspaceSlug: string) => {
    const response = await this.issueTypeService.list(workspaceSlug);
    runInAction(() => {
      response.forEach((issueType) => {
        set(this.issueTypeMap, [issueType.id], issueType);
      });
      set(this.fetchedMap, workspaceSlug, true);
    });
    return response;
  };

  /**
   * Fetches all issue types enabled for a project
   */
  fetchProjectIssueTypes = async (workspaceSlug: string, projectId: string) => {
    const response = await this.projectIssueTypeService.list(workspaceSlug, projectId);
    runInAction(() => {
      response.forEach((projectIssueType) => {
        set(this.projectIssueTypeMap, [projectIssueType.id], projectIssueType);
        // Also store the issue type detail if available
        if (projectIssueType.issue_type_detail) {
          set(this.issueTypeMap, [projectIssueType.issue_type_id], {
            ...this.issueTypeMap[projectIssueType.issue_type_id],
            ...projectIssueType.issue_type_detail,
            id: projectIssueType.issue_type_id,
          });
        }
      });
      set(this.projectFetchedMap, projectId, true);
    });
    return response;
  };

  /**
   * Creates a new issue type in the workspace
   */
  createIssueType = async (workspaceSlug: string, data: Partial<IIssueType>) => {
    const response = await this.issueTypeService.create(workspaceSlug, data);
    runInAction(() => {
      set(this.issueTypeMap, [response.id], response);
    });
    return response;
  };

  /**
   * Updates an issue type
   */
  updateIssueType = async (workspaceSlug: string, issueTypeId: string, data: Partial<IIssueType>) => {
    const originalIssueType = this.issueTypeMap[issueTypeId];
    try {
      runInAction(() => {
        set(this.issueTypeMap, [issueTypeId], { ...this.issueTypeMap[issueTypeId], ...data });
      });
      const response = await this.issueTypeService.update(workspaceSlug, issueTypeId, data);
      return response;
    } catch (error) {
      runInAction(() => {
        this.issueTypeMap = {
          ...this.issueTypeMap,
          [issueTypeId]: originalIssueType,
        };
      });
      throw error;
    }
  };

  /**
   * Deletes an issue type
   */
  deleteIssueType = async (workspaceSlug: string, issueTypeId: string) => {
    if (!this.issueTypeMap[issueTypeId]) return;
    await this.issueTypeService.destroy(workspaceSlug, issueTypeId);
    runInAction(() => {
      delete this.issueTypeMap[issueTypeId];
    });
  };

  /**
   * Adds an issue type to a project
   */
  addIssueTypeToProject = async (workspaceSlug: string, projectId: string, issueTypeId: string) => {
    const response = await this.projectIssueTypeService.create(workspaceSlug, projectId, { issue_type_id: issueTypeId });
    runInAction(() => {
      set(this.projectIssueTypeMap, [response.id], response);
    });
    return response;
  };

  /**
   * Updates a project issue type
   */
  updateProjectIssueType = async (
    workspaceSlug: string,
    projectId: string,
    projectIssueTypeId: string,
    data: Partial<IProjectIssueType>
  ) => {
    const originalProjectIssueType = this.projectIssueTypeMap[projectIssueTypeId];
    try {
      runInAction(() => {
        set(this.projectIssueTypeMap, [projectIssueTypeId], {
          ...this.projectIssueTypeMap[projectIssueTypeId],
          ...data,
        });
      });
      const response = await this.projectIssueTypeService.update(workspaceSlug, projectId, projectIssueTypeId, data);
      return response;
    } catch (error) {
      runInAction(() => {
        this.projectIssueTypeMap = {
          ...this.projectIssueTypeMap,
          [projectIssueTypeId]: originalProjectIssueType,
        };
      });
      throw error;
    }
  };

  /**
   * Removes an issue type from a project
   */
  removeIssueTypeFromProject = async (workspaceSlug: string, projectId: string, projectIssueTypeId: string) => {
    if (!this.projectIssueTypeMap[projectIssueTypeId]) return;
    await this.projectIssueTypeService.destroy(workspaceSlug, projectId, projectIssueTypeId);
    runInAction(() => {
      delete this.projectIssueTypeMap[projectIssueTypeId];
    });
  };

  /**
   * Sets an issue type as the default for a project
   */
  setDefaultProjectIssueType = async (workspaceSlug: string, projectId: string, projectIssueTypeId: string) => {
    const originalProjectIssueTypes = { ...this.projectIssueTypeMap };
    const currentDefault = Object.values(this.projectIssueTypeMap).find(
      (pit) => pit.project_id === projectId && pit.is_default
    );
    try {
      runInAction(() => {
        if (currentDefault) set(this.projectIssueTypeMap, [currentDefault.id, "is_default"], false);
        set(this.projectIssueTypeMap, [projectIssueTypeId, "is_default"], true);
      });
      await this.projectIssueTypeService.update(workspaceSlug, projectId, projectIssueTypeId, { is_default: true });
    } catch (error) {
      runInAction(() => {
        this.projectIssueTypeMap = originalProjectIssueTypes;
      });
      throw error;
    }
  };
}
