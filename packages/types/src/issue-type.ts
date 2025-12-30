// Issue Type types

export type TIssueTypeLogoProps = {
  in_use: string;
  icon?: {
    name: string;
    color: string;
  };
  emoji?: {
    value: string;
    url: string;
  };
};

export interface IIssueType {
  readonly id: string;
  workspace_id: string;
  name: string;
  description: string;
  logo_props: TIssueTypeLogoProps;
  is_epic: boolean;
  is_default: boolean;
  is_active: boolean;
  level: number;
}

export interface IIssueTypeLite {
  readonly id: string;
  name: string;
  logo_props: TIssueTypeLogoProps;
  is_epic: boolean;
}

export interface IProjectIssueType {
  readonly id: string;
  project_id: string;
  issue_type_id: string;
  issue_type_detail?: IIssueTypeLite;
  level: number;
  is_default: boolean;
}

export type TIssueTypeOperationsCallbacks = {
  createIssueType: (data: Partial<IIssueType>) => Promise<IIssueType>;
  updateIssueType: (issueTypeId: string, data: Partial<IIssueType>) => Promise<IIssueType | undefined>;
  deleteIssueType: (issueTypeId: string) => Promise<void>;
};

export type TProjectIssueTypeOperationsCallbacks = {
  addIssueType: (issueTypeId: string) => Promise<IProjectIssueType>;
  updateProjectIssueType: (
    projectIssueTypeId: string,
    data: Partial<IProjectIssueType>
  ) => Promise<IProjectIssueType | undefined>;
  removeIssueType: (projectIssueTypeId: string) => Promise<void>;
  setDefaultIssueType: (projectIssueTypeId: string) => Promise<void>;
};
