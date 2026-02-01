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
          const isPrivateChat = message.conversationType === "1";
          const isGroupChat = message.conversationType === "2";
          const chatType = isPrivateChat ? "direct" : "group";
          const chatId = message.conversationId;

          ctx.log?.info(`[${ctx.accountId}] ${chatType} message from ${message.senderStaffId}, type: ${message.msgtype}`);

          try {
            // Prepare message body and media info
            let body = "";
            let mediaPath: string | undefined;
            let mediaType: string | undefined;

            if (message.msgtype === "text") {
              body = message.text?.content ?? "";
            } else if (message.msgtype === "picture") {
              ctx.log?.info(`[${ctx.accountId}] Downloading picture...`);
              try {
                const result = await runtime.channel.dingtalk.downloadFileDingTalk({
                  downloadCode: message.content.downloadCode,
                  accountId: ctx.accountId,
                  config: ctx.cfg,
                });
                // Save to temp file
                const fs = await import("node:fs");
                const path = await import("node:path");
                const os = await import("node:os");
                const tempDir = path.join(os.tmpdir(), "clawdbot-dingtalk");
                if (!fs.existsSync(tempDir)) {
                  fs.mkdirSync(tempDir, { recursive: true });
                }
                const tempFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
                mediaPath = path.join(tempDir, tempFileName);
                fs.writeFileSync(mediaPath, result);
                mediaType = "image/jpeg";
                body = "[用户发送了一张图片]";
                ctx.log?.info(`[${ctx.accountId}] Picture downloaded to ${mediaPath}`);
              } catch (err) {
                ctx.log?.error(`[${ctx.accountId}] Failed to download picture: ${err}`);
                body = "[用户发送了一张图片，但下载失败]";
              }
            } else if (message.msgtype === "file") {
              const fileName = message.content?.fileName || "未知文件";
              ctx.log?.info(`[${ctx.accountId}] Downloading file: ${fileName}...`);
              try {
                const result = await runtime.channel.dingtalk.downloadFileDingTalk({
                  downloadCode: message.content.downloadCode,
                  accountId: ctx.accountId,
                  config: ctx.cfg,
                });
                // Save to temp file
                const fs = await import("node:fs");
                const path = await import("node:path");
                const os = await import("node:os");
                const tempDir = path.join(os.tmpdir(), "clawdbot-dingtalk");
                if (!fs.existsSync(tempDir)) {
                  fs.mkdirSync(tempDir, { recursive: true });
                }
                const ext = path.extname(fileName) || ".bin";
                const tempFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
                mediaPath = path.join(tempDir, tempFileName);
                fs.writeFileSync(mediaPath, result);
                // Guess media type
                if ([".pdf"].includes(ext.toLowerCase())) {
                  mediaType = "application/pdf";
                } else if ([".txt", ".md"].includes(ext.toLowerCase())) {
                  mediaType = "text/plain";
                } else {
                  mediaType = "application/octet-stream";
                }
                body = `[用户发送了文件: ${fileName}]`;
                ctx.log?.info(`[${ctx.accountId}] File downloaded to ${mediaPath}`);
              } catch (err) {
                ctx.log?.error(`[${ctx.accountId}] Failed to download file: ${err}`);
                body = `[用户发送了文件: ${fileName}，但下载失败]`;
              }
            } else if (message.msgtype === "audio") {
              const recognition = message.content?.recognition;
              if (recognition && recognition.trim()) {
                body = recognition.trim();
                ctx.log?.info(`[${ctx.accountId}] Using speech recognition: ${body.slice(0, 50)}...`);
              } else {
                const duration = message.content?.duration || 0;
                body = `[用户发送了语音消息${duration > 0 ? `, 时长: ${duration}秒` : ""}]`;
              }
            } else if (message.msgtype === "video") {
              const duration = message.content?.duration || 0;
              const videoType = message.content?.videoType;
              body = `[用户发送了视频消息${duration > 0 ? `, 时长: ${duration}秒` : ""}${videoType ? `, 格式: ${videoType}` : ""}]`;
            } else {
              ctx.log?.warn(`[${ctx.accountId}] Unsupported message type: ${message.msgtype}`);
              return;
            }

            ctx.log?.info(`[${ctx.accountId}] Building inbound context...`);

            // Build inbound context for the message
            const inboundCtx = runtime.channel.reply.finalizeInboundContext({
              Body: body,
              From: message.senderStaffId,
              SenderId: message.senderStaffId,
              SenderName: message.senderNick,
              SessionKey: `dingtalk:${chatId}`,
              AccountId: ctx.accountId,
              MessageSid: message.msgId,
              ChatType: chatType,
              ChatId: chatId,
              MediaPath: mediaPath,
              MediaType: mediaType,
              ForceAddSenderMeta: true, // Force add sender info even for private chats
            });
            ctx.log?.info(`[${ctx.accountId}] Inbound context built, dispatching reply...`);

            // Dispatch reply
            const result = await runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
              ctx: inboundCtx,
              cfg: ctx.cfg,
              dispatcherOptions: {
                deliver: async (payload, info) => {
                  ctx.log?.info(`[${ctx.accountId}] Deliver called with payload: ${JSON.stringify(payload).slice(0, 200)}, kind: ${info?.kind}`);

                  // Only send final messages to avoid duplicate replies
                  if (info?.kind !== "final") {
                    ctx.log?.info(`[${ctx.accountId}] Skipping non-final message (kind: ${info?.kind})`);
                    return;
                  }

                  // Skip tool execution status messages
                  const text = payload.text ?? "";
                  if (text === "Tool execution." || text.trim() === "Tool execution.") {
                    ctx.log?.info(`[${ctx.accountId}] Skipping tool execution status message`);
                    return;
                  }

                  // Send reply using DingTalk API
                  if (text) {
                    ctx.log?.info(`[${ctx.accountId}] Sending reply: ${text.slice(0, 100)}...`);

                    if (isGroupChat && message.sessionWebhook) {
                      // For group chat, use sessionWebhook
                      ctx.log?.info(`[${ctx.accountId}] Using sessionWebhook for group reply`);
                      const response = await fetch(message.sessionWebhook, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          msgtype: "markdown",
                          markdown: {
                            title: "回复",
                            text,
                          },
                        }),
                      });
                      if (!response.ok) {
                        throw new Error(`Failed to send group message: ${response.status} ${await response.text()}`);
                      }
                    } else {
                      // For private chat, use Markdown format
                      await runtime.channel.dingtalk.sendMarkdownDingTalk({
                        config: ctx.cfg,
                        accountId: ctx.accountId,
                        userId: message.senderStaffId,
                        title: "回复",
                        text,
                      });
                    }

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
