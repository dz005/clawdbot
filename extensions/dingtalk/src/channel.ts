import {
  buildChannelConfigSchema,
  DEFAULT_ACCOUNT_ID,
  DingTalkConfigSchema,
  getChatChannelMeta,
  normalizeAccountId,
  type ChannelPlugin,
} from "clawdbot/plugin-sdk";

import { getDingTalkRuntime } from "./runtime.js";

const meta = getChatChannelMeta("dingtalk");

export type DingTalkAccountConfig = {
  accountId: string;
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
  robotCode?: string;
};

function listDingTalkAccountIds(cfg: any): string[] {
  const accounts = cfg.channels?.dingtalk?.accounts ?? {};
  const accountIds = Object.keys(accounts);

  // Check if legacy top-level config exists
  const hasLegacyConfig = Boolean(
    cfg.channels?.dingtalk?.clientId ||
    cfg.channels?.dingtalk?.clientSecret ||
    cfg.channels?.dingtalk?.robotCode
  );

  if (hasLegacyConfig && !accountIds.includes(DEFAULT_ACCOUNT_ID)) {
    accountIds.unshift(DEFAULT_ACCOUNT_ID);
  }

  return accountIds.length > 0 ? accountIds : [DEFAULT_ACCOUNT_ID];
}

function resolveDefaultDingTalkAccountId(cfg: any): string {
  return cfg.channels?.dingtalk?.defaultAccount ?? DEFAULT_ACCOUNT_ID;
}

function resolveDingTalkAccount(opts: { cfg: any; accountId?: string }): DingTalkAccountConfig {
  const { cfg, accountId } = opts;
  const resolvedAccountId = normalizeAccountId(
    accountId ?? resolveDefaultDingTalkAccountId(cfg),
  );

  const accounts = cfg.channels?.dingtalk?.accounts ?? {};
  const accountConfig = accounts[resolvedAccountId];

  // Try legacy top-level config if account not found
  if (!accountConfig && resolvedAccountId === DEFAULT_ACCOUNT_ID) {
    const legacyConfig = cfg.channels?.dingtalk;
    return {
      accountId: resolvedAccountId,
      enabled: true,
      clientId: legacyConfig?.clientId,
      clientSecret: legacyConfig?.clientSecret,
      robotCode: legacyConfig?.robotCode,
    };
  }

  return {
    accountId: resolvedAccountId,
    enabled: accountConfig?.enabled ?? true,
    clientId: accountConfig?.clientId,
    clientSecret: accountConfig?.clientSecret,
    robotCode: accountConfig?.robotCode,
  };
}

export const dingtalkPlugin: ChannelPlugin<DingTalkAccountConfig> = {
  id: "dingtalk",
  meta: {
    ...meta,
  },
  capabilities: {
    chatTypes: ["direct"],
    polls: false,
    reactions: false,
    threads: false,
    media: false,
    nativeCommands: false,
  },
  reload: { configPrefixes: ["channels.dingtalk"] },
  configSchema: buildChannelConfigSchema(DingTalkConfigSchema),
  config: {
    listAccountIds: (cfg) => listDingTalkAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveDingTalkAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultDingTalkAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const resolvedAccountId = normalizeAccountId(accountId ?? DEFAULT_ACCOUNT_ID);
      if (!cfg.channels) cfg.channels = {};
      if (!cfg.channels.dingtalk) cfg.channels.dingtalk = {};
      if (!cfg.channels.dingtalk.accounts) cfg.channels.dingtalk.accounts = {};
      if (!cfg.channels.dingtalk.accounts[resolvedAccountId]) {
        cfg.channels.dingtalk.accounts[resolvedAccountId] = {};
      }
      cfg.channels.dingtalk.accounts[resolvedAccountId].enabled = enabled;
    },
    deleteAccount: ({ cfg, accountId }) => {
      const resolvedAccountId = normalizeAccountId(accountId ?? DEFAULT_ACCOUNT_ID);
      if (cfg.channels?.dingtalk?.accounts?.[resolvedAccountId]) {
        delete cfg.channels.dingtalk.accounts[resolvedAccountId];
      }
      // Clear legacy config if deleting default account
      if (resolvedAccountId === DEFAULT_ACCOUNT_ID && cfg.channels?.dingtalk) {
        delete cfg.channels.dingtalk.clientId;
        delete cfg.channels.dingtalk.clientSecret;
        delete cfg.channels.dingtalk.robotCode;
      }
    },
    isConfigured: (account) =>
      Boolean(account.clientId?.trim() && account.clientSecret?.trim() && account.robotCode?.trim()),
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: Boolean(
        account.clientId?.trim() && account.clientSecret?.trim() && account.robotCode?.trim()
      ),
    }),
    resolveAllowFrom: () => [],
    formatAllowFrom: ({ allowFrom }) => allowFrom,
  },
  security: {
    resolveDmPolicy: ({ account }) => ({
      policy: "open",
      allowFrom: [],
      allowFromPath: `channels.dingtalk.accounts.${account.accountId}.dm.`,
      approveHint: "DingTalk DM policy is always open",
      normalizeEntry: (raw) => raw.trim(),
    }),
    collectWarnings: () => [],
  },
  messaging: {
    normalizeTarget: (target) => target.trim(),
    targetResolver: {
      looksLikeId: (id) => /^[a-zA-Z0-9_-]+$/.test(id),
      hint: "<userId>",
    },
  },
  gateway: {
    startAccount: async (ctx) => {
      const runtime = getDingTalkRuntime();
      await runtime.channel.dingtalk.monitorDingTalkProvider({
        config: ctx.cfg,
        accountId: ctx.accountId,
        abortSignal: ctx.abortSignal,
        onMessage: async (message) => {
          ctx.log?.info(`[${ctx.accountId}] DM from ${message.senderStaffId}: ${message.text?.content?.slice(0, 50)}...`);

          try {
            ctx.log?.info(`[${ctx.accountId}] Building inbound context...`);
            // Build inbound context for the message
            const inboundCtx = runtime.channel.reply.finalizeInboundContext({
              Body: message.text?.content ?? "",
              From: message.senderStaffId,
              FromName: message.senderNick || message.senderStaffId,
              SessionKey: `dingtalk:${message.senderStaffId}`,
              AccountId: ctx.accountId,
              MessageSid: message.msgId,
              ChatType: "direct",
              ChatId: message.senderStaffId,
            });
            ctx.log?.info(`[${ctx.accountId}] Inbound context built, dispatching reply...`);

            // Dispatch reply
            const result = await runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
              ctx: inboundCtx,
              cfg: ctx.cfg,
              dispatcherOptions: {
                deliver: async (payload) => {
                  ctx.log?.info(`[${ctx.accountId}] Deliver called with payload: ${JSON.stringify(payload).slice(0, 200)}`);
                  // Send reply using DingTalk API
                  const text = payload.text ?? "";
                  if (text) {
                    ctx.log?.info(`[${ctx.accountId}] Sending reply: ${text.slice(0, 100)}...`);

                    // Use Markdown format for better rendering
                    await runtime.channel.dingtalk.sendMarkdownDingTalk({
                      config: ctx.cfg,
                      accountId: ctx.accountId,
                      userId: message.senderStaffId,
                      title: "回复",
                      text,
                    });

                    ctx.log?.info(`[${ctx.accountId}] Reply sent successfully`);
                  } else {
                    ctx.log?.warn(`[${ctx.accountId}] No text in payload to send`);
                  }
                },
              },
            });
            ctx.log?.info(`[${ctx.accountId}] Dispatch completed, result: ${JSON.stringify(result).slice(0, 200)}`);
          } catch (err) {
            ctx.log?.error(`[${ctx.accountId}] Error processing message: ${err}`);
            ctx.log?.error(`[${ctx.accountId}] Error stack: ${(err as Error).stack}`);
          }
        },
      });
    },
  },
  status: {
    probe: async ({ cfg, accountId }) => {
      const account = resolveDingTalkAccount({ cfg, accountId });
      const issues: Array<{ severity: "error" | "warning"; message: string }> = [];

      if (!account.clientId?.trim()) {
        issues.push({
          severity: "error",
          message: "Missing clientId (set channels.dingtalk.clientId or DINGTALK_CLIENT_ID)",
        });
      }

      if (!account.clientSecret?.trim()) {
        issues.push({
          severity: "error",
          message: "Missing clientSecret (set channels.dingtalk.clientSecret or DINGTALK_CLIENT_SECRET)",
        });
      }

      if (!account.robotCode?.trim()) {
        issues.push({
          severity: "error",
          message: "Missing robotCode (set channels.dingtalk.robotCode or DINGTALK_ROBOT_CODE)",
        });
      }

      return { issues };
    },
  },
};
