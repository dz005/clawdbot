import type { ClawdbotConfig } from "../config/config.js";
import { resolveDingTalkAccount } from "./accounts.js";
import { DingTalkTokenCache, sendDingTalkBatchMessage } from "./api.js";

export type SendDingTalkMessageOptions = {
  userId: string;
  text: string;
  accountId?: string;
  config?: ClawdbotConfig;
};

const tokenCache = new DingTalkTokenCache();

/**
 * Send a text message to a DingTalk user
 */
export async function sendMessageDingTalk(opts: SendDingTalkMessageOptions): Promise<void> {
  const account = resolveDingTalkAccount({
    cfg: opts.config ?? (await import("../config/config.js")).loadConfig(),
    accountId: opts.accountId,
  });

  const { clientId, clientSecret, robotCode } = account.config;

  // Get access token
  const accessToken = await tokenCache.getToken({ clientId, clientSecret });

  // Send message
  const msgParam = JSON.stringify({
    content: opts.text,
  });

  await sendDingTalkBatchMessage({
    accessToken,
    robotCode,
    userIds: [opts.userId],
    msgKey: "sampleText",
    msgParam,
  });
}

/**
 * Send a markdown message to a DingTalk user
 */
export async function sendMarkdownDingTalk(opts: {
  userId: string;
  title: string;
  text: string;
  accountId?: string;
  config?: ClawdbotConfig;
}): Promise<void> {
  const account = resolveDingTalkAccount({
    cfg: opts.config ?? (await import("../config/config.js")).loadConfig(),
    accountId: opts.accountId,
  });

  const { clientId, clientSecret, robotCode } = account.config;

  // Get access token
  const accessToken = await tokenCache.getToken({ clientId, clientSecret });

  // Send markdown message
  const msgParam = JSON.stringify({
    title: opts.title,
    text: opts.text,
  });

  await sendDingTalkBatchMessage({
    accessToken,
    robotCode,
    userIds: [opts.userId],
    msgKey: "sampleMarkdown",
    msgParam,
  });
}
