/**
 * DingTalk channel configuration types
 */

export type DingTalkAccountConfig = {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
  robotCode?: string;
};

export type DingTalkConfig = {
  defaultAccount?: string;
  accounts?: Record<string, DingTalkAccountConfig>;
  // Legacy top-level config (for backward compatibility)
  clientId?: string;
  clientSecret?: string;
  robotCode?: string;
};
