import { DWClient, TOPIC_ROBOT, type DWClientDownStream } from "dingtalk-stream";
import type { ClawdbotConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import { resolveDingTalkAccount } from "./accounts.js";
import type { DingTalkCallbackEvent, DingTalkMessage, DingTalkTextMessage } from "./types.js";
import { danger, shouldLogVerbose } from "../globals.js";
import { getChildLogger } from "../logging.js";

export type DingTalkMessageHandler = (message: DingTalkMessage) => Promise<void> | void;

export type MonitorDingTalkOptions = {
  accountId?: string;
  config?: ClawdbotConfig;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
  onMessage?: DingTalkMessageHandler;
};

/**
 * Monitor DingTalk messages using Stream mode
 */
export async function monitorDingTalkProvider(opts: MonitorDingTalkOptions = {}): Promise<void> {
  const cfg = opts.config ?? (await import("../config/config.js")).loadConfig();
  const account = resolveDingTalkAccount({
    cfg,
    accountId: opts.accountId,
  });

  const runtime: RuntimeEnv = opts.runtime ?? {
    log: console.log,
    error: console.error,
    exit: (code: number): never => {
      throw new Error(`exit ${code}`);
    },
  };

  const logger = getChildLogger({ subsystem: "dingtalk" });

  const { clientId, clientSecret } = account.config;

  logger.info(`Starting DingTalk Stream client for account "${account.accountId}"...`);

  // Create DingTalk Stream client
  const client = new DWClient({
    clientId,
    clientSecret,
  });

  // Register message callback handler
  client.registerCallbackListener(TOPIC_ROBOT, (event: DWClientDownStream) => {
    // Always log that we received an event
    logger.info(`Received DingTalk event: type=${event.type}`);

    // Acknowledge message immediately to prevent server retry
    try {
      client.socketCallBackResponse(event.headers.messageId, {
        status: "SUCCESS",
        message: "OK",
      });
    } catch (err) {
      logger.error(danger(`Failed to acknowledge message: ${err}`));
    }

    // Parse the data field which is a JSON string
    let parsedEvent: DingTalkCallbackEvent;
    try {
      parsedEvent = {
        specVersion: event.specVersion,
        type: event.type,
        headers: {
          contentType: event.headers.contentType,
          eventId: event.headers.eventId ?? "",
          eventType: event.headers.eventType ?? "",
          eventBornTime: Number(event.headers.eventBornTime ?? 0),
          eventCorpId: event.headers.eventCorpId ?? "",
          eventUnifiedAppId: event.headers.eventUnifiedAppId ?? "",
        },
        data: JSON.parse(event.data) as DingTalkMessage,
      };
    } catch (err) {
      logger.error(danger(`Failed to parse DingTalk event: ${err}`));
      return;
    }

    logger.info(`Parsed event data: ${JSON.stringify(parsedEvent, null, 2)}`);

    const message = parsedEvent.data;

    // Log message details
    logger.info(`Message type: ${message.msgtype}, conversationType: ${message.conversationType}`);
    logger.info(
      `Message senderNick: ${message.senderNick}, senderStaffId: ${message.senderStaffId}`,
    );

    const isPrivateChat = message.conversationType === "1";
    const isGroupChat = message.conversationType === "2";

    // For group chat, only respond if bot is mentioned
    if (isGroupChat && !message.isInAtList) {
      logger.info(`Skipping group message: bot not mentioned`);
      return;
    }

    if (!isPrivateChat && !isGroupChat) {
      logger.info(`Skipping message: unsupported conversationType=${message.conversationType}`);
      return;
    }

    // Handle different message types
    if (message.msgtype === "text") {
      logger.info(
        `Processing ${isPrivateChat ? "private" : "group"} text message from ${message.senderStaffId}`,
      );
      if (opts.onMessage) {
        logger.info(`Calling onMessage handler...`);
        // Call handler asynchronously but don't wait
        Promise.resolve(opts.onMessage(message))
          .then(() => {
            logger.info(`onMessage handler completed successfully`);
          })
          .catch((err) => {
            logger.error(danger(`Error handling DingTalk message: ${err}`));
            logger.error(danger(`Error stack: ${err.stack}`));
          });
      } else {
        logger.warn("No onMessage handler configured");
      }
    } else if (message.msgtype === "picture") {
      logger.info(
        `Received picture message from ${message.senderStaffId}, full data: ${JSON.stringify(message, null, 2)}`,
      );
      // Convert to text description for AI
      const textMessage: DingTalkTextMessage = {
        ...message,
        msgtype: "text",
        text: {
          content: "[用户发送了一张图片]",
        },
      };
      if (opts.onMessage) {
        Promise.resolve(opts.onMessage(textMessage))
          .then(() => {
            logger.info(`Picture message handled as text description`);
          })
          .catch((err) => {
            logger.error(danger(`Error handling picture message: ${err}`));
          });
      }
    } else if (message.msgtype === "file") {
      logger.info(
        `Received file message from ${message.senderStaffId}, full data: ${JSON.stringify(message, null, 2)}`,
      );
      // Convert to text description for AI
      const fileName = message.content?.fileName || "未知文件";
      const textMessage: DingTalkTextMessage = {
        ...message,
        msgtype: "text",
        text: {
          content: `[用户发送了文件: ${fileName}]`,
        },
      };
      if (opts.onMessage) {
        Promise.resolve(opts.onMessage(textMessage))
          .then(() => {
            logger.info(`File message handled as text description`);
          })
          .catch((err) => {
            logger.error(danger(`Error handling file message: ${err}`));
          });
      }
    } else if (message.msgtype === "audio") {
      logger.info(
        `Received audio message from ${message.senderStaffId}, full data: ${JSON.stringify(message, null, 2)}`,
      );
      const duration = message.content?.duration || 0;
      const recognition = message.content?.recognition;

      let content: string;
      if (recognition && recognition.trim()) {
        // If speech recognition is available, use it as the main content
        content = recognition.trim();
        logger.info(`Using speech recognition content: ${content}`);
      } else {
        // Fallback to description if no recognition
        content = `[用户发送了语音消息`;
        if (duration > 0) {
          content += `, 时长: ${duration}秒`;
        }
        content += `]`;
      }

      const textMessage: DingTalkTextMessage = {
        ...message,
        msgtype: "text",
        text: {
          content,
        },
      };
      if (opts.onMessage) {
        Promise.resolve(opts.onMessage(textMessage))
          .then(() => {
            logger.info(`Audio message handled as text description`);
          })
          .catch((err) => {
            logger.error(danger(`Error handling audio message: ${err}`));
          });
      }
    } else if (message.msgtype === "video") {
      logger.info(
        `Received video message from ${message.senderStaffId}, full data: ${JSON.stringify(message, null, 2)}`,
      );
      const duration = message.content?.duration || 0;
      const videoType = message.content?.videoType;
      let content = `[用户发送了视频消息`;
      if (duration > 0) {
        content += `, 时长: ${duration}秒`;
      }
      if (videoType) {
        content += `, 格式: ${videoType}`;
      }
      content += `]`;

      const textMessage: DingTalkTextMessage = {
        ...message,
        msgtype: "text",
        text: {
          content,
        },
      };
      if (opts.onMessage) {
        Promise.resolve(opts.onMessage(textMessage))
          .then(() => {
            logger.info(`Video message handled as text description`);
          })
          .catch((err) => {
            logger.error(danger(`Error handling video message: ${err}`));
          });
      }
    } else {
      logger.info(`Skipping message: unsupported msgtype=${(message as DingTalkMessage).msgtype}`);
      logger.info(`Full message data: ${JSON.stringify(message, null, 2)}`);
    }
  });

  // Handle abort signal
  if (opts.abortSignal) {
    opts.abortSignal.addEventListener("abort", () => {
      logger.info("Stopping DingTalk Stream client...");
      client.disconnect();
    });
  }

  // Connect to DingTalk Stream
  try {
    await client.connect();
    logger.info("DingTalk Stream client connected successfully");
  } catch (err) {
    runtime.error?.(danger(`Failed to connect DingTalk Stream client: ${err}`));
    throw err;
  }

  // Keep the connection alive
  return new Promise((resolve, reject) => {
    client.on("error", (err: Error) => {
      runtime.error?.(danger(`DingTalk Stream client error: ${err.message}`));
      reject(err);
    });

    if (opts.abortSignal) {
      opts.abortSignal.addEventListener("abort", () => {
        resolve();
      });
    }
  });
}
