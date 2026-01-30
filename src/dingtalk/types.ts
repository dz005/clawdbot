/**
 * DingTalk channel types
 */

export type DingTalkConfig = {
  clientId: string;
  clientSecret: string;
  robotCode: string;
};

export type DingTalkAccountConfig = {
  accountId: string;
  config: DingTalkConfig;
};

export type DingTalkTextMessage = {
  conversationId: string;
  atUsers: Array<{ dingtalkId: string; staffId?: string }>;
  chatbotCorpId: string;
  chatbotUserId: string;
  msgId: string;
  senderNick: string;
  isAdmin: boolean;
  senderStaffId: string;
  sessionWebhookExpiredTime: number;
  createAt: number;
  senderCorpId: string;
  conversationType: string;
  senderId: string;
  conversationTitle: string;
  isInAtList: boolean;
  sessionWebhook: string;
  text: {
    content: string;
  };
  msgtype: "text";
};

export type DingTalkMessage = DingTalkTextMessage;

export type DingTalkCallbackEvent = {
  specVersion: string;
  type: string;
  headers: {
    contentType: string;
    eventId: string;
    eventType: string;
    eventBornTime: number;
    eventCorpId: string;
    eventUnifiedAppId: string;
  };
  data: DingTalkMessage;
};
