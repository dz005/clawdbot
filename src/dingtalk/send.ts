import type { ClawdbotConfig } from "../config/config.js";
import { resolveDingTalkAccount } from "./accounts.js";
import {
  DingTalkTokenCache,
  sendDingTalkBatchMessage,
  downloadDingTalkFile,
  uploadDingTalkMedia,
} from "./api.js";

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

/**
 * Download a file from DingTalk using downloadCode
 */
export async function downloadFileDingTalk(opts: {
  downloadCode: string;
  accountId?: string;
  config?: ClawdbotConfig;
}): Promise<Buffer> {
  const account = resolveDingTalkAccount({
    cfg: opts.config ?? (await import("../config/config.js")).loadConfig(),
    accountId: opts.accountId,
  });

  const { clientId, clientSecret, robotCode } = account.config;

  // Get access token
  const accessToken = await tokenCache.getToken({ clientId, clientSecret });

  // Download file
  return await downloadDingTalkFile({
    accessToken,
    downloadCode: opts.downloadCode,
    robotCode,
  });
}

/**
 * Send an image message to DingTalk user
 */
export async function sendImageDingTalk(opts: {
  userId: string;
  imageBuffer: Buffer;
  fileName?: string;
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

  // Upload image and get mediaId
  const mediaId = await uploadDingTalkMedia({
    accessToken,
    type: "image",
    media: opts.imageBuffer,
    fileName: opts.fileName || "image.jpg",
  });

  // Send image message
  const msgParam = JSON.stringify({
    mediaId,
  });

  await sendDingTalkBatchMessage({
    accessToken,
    robotCode,
    userIds: [opts.userId],
    msgKey: "sampleImageMsg",
    msgParam,
  });
}

/**
 * Send a file message to DingTalk user
 */
export async function sendFileDingTalk(opts: {
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
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

  // Upload file and get mediaId
  const mediaId = await uploadDingTalkMedia({
    accessToken,
    type: "file",
    media: opts.fileBuffer,
    fileName: opts.fileName,
  });

  // Extract file extension
  const fileExt = opts.fileName.split(".").pop() || "file";

  // Send file message with correct format
  // Note: msgKey might need to be adjusted based on DingTalk's requirements
  const msgParam = JSON.stringify({
    mediaId,
    fileName: opts.fileName,
    fileType: fileExt,
  });

  // Try using 'sampleFile' as msgKey (may need adjustment)
  await sendDingTalkBatchMessage({
    accessToken,
    robotCode,
    userIds: [opts.userId],
    msgKey: "sampleFile",
    msgParam,
  });
}

/**
 * Send a voice message to DingTalk user
 */
export async function sendVoiceDingTalk(opts: {
  userId: string;
  voiceBuffer: Buffer;
  duration: number;
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

  // Upload voice and get mediaId
  const mediaId = await uploadDingTalkMedia({
    accessToken,
    type: "voice",
    media: opts.voiceBuffer,
    fileName: "voice.amr",
  });

  // Send voice message
  const msgParam = JSON.stringify({
    mediaId,
    duration: opts.duration,
  });

  await sendDingTalkBatchMessage({
    accessToken,
    robotCode,
    userIds: [opts.userId],
    msgKey: "sampleAudio",
    msgParam,
  });
}

/**
 * Send a video message to DingTalk user
 */
export async function sendVideoDingTalk(opts: {
  userId: string;
  videoBuffer: Buffer;
  duration: number;
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

  // Upload video and get mediaId
  const mediaId = await uploadDingTalkMedia({
    accessToken,
    type: "video",
    media: opts.videoBuffer,
    fileName: "video.mp4",
  });

  // Send video message
  const msgParam = JSON.stringify({
    mediaId,
    duration: opts.duration,
    videoType: "mp4",
  });

  await sendDingTalkBatchMessage({
    accessToken,
    robotCode,
    userIds: [opts.userId],
    msgKey: "sampleVideo",
    msgParam,
  });
}
