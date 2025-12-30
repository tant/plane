// icons
import { EUserPermissions } from "@plane/constants";
import { SettingIcon } from "@/components/icons/attachment";
// types
import type { Props } from "@/components/icons/types";
// constants

export const PROJECT_SETTINGS = {
  general: {
    key: "general",
    i18n_label: "common.general",
    href: ``,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/`,
    Icon: SettingIcon,
  },
  members: {
    key: "members",
    i18n_label: "common.members",
    href: `/members`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER, EUserPermissions.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/members/`,
    Icon: SettingIcon,
  },
  features: {
    key: "features",
    i18n_label: "common.features",
    href: `/features`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/features/`,
    Icon: SettingIcon,
  },
  states: {
    key: "states",
    i18n_label: "common.states",
    href: `/states`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/states/`,
    Icon: SettingIcon,
  },
  labels: {
    key: "labels",
    i18n_label: "common.labels",
    href: `/labels`,
    access: [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/labels/`,
    Icon: SettingIcon,
  },
  estimates: {
    key: "estimates",
    i18n_label: "common.estimates",
    href: `/estimates`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/estimates/`,
    Icon: SettingIcon,
  },
  automations: {
    key: "automations",
    i18n_label: "project_settings.automations.label",
    href: `/automations`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/automations/`,
    Icon: SettingIcon,
  },
  workflows: {
    key: "workflows",
    i18n_label: "project_settings.workflows.label",
    href: `/workflows`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/workflows/`,
    Icon: SettingIcon,
  },
  workItemTypes: {
    key: "work-item-types",
    i18n_label: "project_settings.work_item_types.label",
    href: `/work-item-types`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/work-item-types/`,
    Icon: SettingIcon,
  },
  epics: {
    key: "epics",
    i18n_label: "common.epics",
    href: `/epics`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/epics/`,
    Icon: SettingIcon,
  },
  projectUpdates: {
    key: "project-updates",
    i18n_label: "project_settings.project_updates.label",
    href: `/project-updates`,
    access: [EUserPermissions.ADMIN],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}/project-updates/`,
    Icon: SettingIcon,
  },
};

export const PROJECT_SETTINGS_LINKS: {
  key: string;
  i18n_label: string;
  href: string;
  access: EUserPermissions[];
  highlight: (pathname: string, baseUrl: string) => boolean;
  Icon: React.FC<Props>;
}[] = [
  PROJECT_SETTINGS["general"],
  PROJECT_SETTINGS["members"],
  PROJECT_SETTINGS["features"],
  PROJECT_SETTINGS["states"],
  PROJECT_SETTINGS["workflows"],
  PROJECT_SETTINGS["labels"],
  PROJECT_SETTINGS["estimates"],
  PROJECT_SETTINGS["automations"],
  PROJECT_SETTINGS["workItemTypes"],
  PROJECT_SETTINGS["epics"],
  PROJECT_SETTINGS["projectUpdates"],
];
