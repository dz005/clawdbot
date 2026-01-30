import type { ClawdbotConfig } from "../config/config.js";
import type { DingTalkAccountConfig, DingTalkConfig } from "./types.js";

export function resolveDingTalkAccount(opts: {
  cfg: ClawdbotConfig;
  accountId?: string;
}): DingTalkAccountConfig {
  const { cfg, accountId } = opts;
  const accounts = cfg.channels?.dingtalk?.accounts ?? {};
  const defaultAccountId = cfg.channels?.dingtalk?.defaultAccount ?? "default";
  const resolvedAccountId = accountId ?? defaultAccountId;

  const accountConfig = accounts[resolvedAccountId];

  // Try legacy top-level config if account not found
  if (!accountConfig && resolvedAccountId === "default") {
    const legacyConfig = cfg.channels?.dingtalk;
    if (legacyConfig?.clientId || legacyConfig?.clientSecret || legacyConfig?.robotCode) {
      const config: DingTalkConfig = {
        clientId: legacyConfig.clientId ?? "",
        clientSecret: legacyConfig.clientSecret ?? "",
        robotCode: legacyConfig.robotCode ?? "",
      };

      if (!config.clientId || !config.clientSecret || !config.robotCode) {
        throw new Error(
          `DingTalk account "${resolvedAccountId}" is missing required credentials (clientId, clientSecret, robotCode)`,
        );
      }

      return {
        accountId: resolvedAccountId,
        config,
      };
    }
  }

  if (!accountConfig) {
    throw new Error(
      `DingTalk account "${resolvedAccountId}" not found in config. Available accounts: ${Object.keys(accounts).join(", ") || "(none)"}`,
    );
  }

  const config: DingTalkConfig = {
    clientId: accountConfig.clientId ?? "",
    clientSecret: accountConfig.clientSecret ?? "",
    robotCode: accountConfig.robotCode ?? "",
  };

  if (!config.clientId || !config.clientSecret || !config.robotCode) {
    throw new Error(
      `DingTalk account "${resolvedAccountId}" is missing required credentials (clientId, clientSecret, robotCode)`,
    );
  }

  return {
    accountId: resolvedAccountId,
    config,
  };
}
