export type PlatformServiceStatus =
  | "offline"
  | "starting"
  | "ready"
  | "disabled"
  | "error";

export const PlatformStatus = {
  database: "offline" as PlatformServiceStatus,
  ai: "offline" as PlatformServiceStatus,
  notifications: "offline" as PlatformServiceStatus,
  search: "offline" as PlatformServiceStatus,
  guardian: "disabled" as PlatformServiceStatus,

  platform: "offline" as PlatformServiceStatus,
  startedAt: null as string | null,
  error: null as string | null,
};
