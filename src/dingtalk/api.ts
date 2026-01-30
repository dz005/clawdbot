/**
 * DingTalk API client for authentication and messaging
 */

export type DingTalkAccessTokenResponse = {
  accessToken: string;
  expireIn: number;
};

export type DingTalkSendMessageRequest = {
  robotCode: string;
  userIds: string[];
  msgKey: string;
  msgParam: string;
};

export type DingTalkSendMessageResponse = {
  processQueryKey: string;
  invalidStaffIdList?: string[];
  flowControlledStaffIdList?: string[];
};

/**
 * Get access token for DingTalk API
 */
export async function getDingTalkAccessToken(params: {
  clientId: string;
  clientSecret: string;
}): Promise<string> {
  const url = "https://api.dingtalk.com/v1.0/oauth2/accessToken";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      appKey: params.clientId,
      appSecret: params.clientSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get DingTalk access token: ${response.status} ${text}`);
  }

  const data = (await response.json()) as DingTalkAccessTokenResponse;
  return data.accessToken;
}

/**
 * Send batch single chat messages via DingTalk API
 */
export async function sendDingTalkBatchMessage(params: {
  accessToken: string;
  robotCode: string;
  userIds: string[];
  msgKey: string;
  msgParam: string;
}): Promise<DingTalkSendMessageResponse> {
  const url = "https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-acs-dingtalk-access-token": params.accessToken,
    },
    body: JSON.stringify({
      robotCode: params.robotCode,
      userIds: params.userIds,
      msgKey: params.msgKey,
      msgParam: params.msgParam,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send DingTalk message: ${response.status} ${text}`);
  }

  return (await response.json()) as DingTalkSendMessageResponse;
}

/**
 * Simple in-memory token cache
 */
export class DingTalkTokenCache {
  private token: string | null = null;
  private expiresAt: number = 0;

  async getToken(params: { clientId: string; clientSecret: string }): Promise<string> {
    const now = Date.now();
    if (this.token && this.expiresAt > now + 60000) {
      // Refresh 1 minute before expiry
      return this.token;
    }

    this.token = await getDingTalkAccessToken(params);
    this.expiresAt = now + 7200000; // 2 hours (default DingTalk token expiry)
    return this.token;
  }

  clear(): void {
    this.token = null;
    this.expiresAt = 0;
  }
}
