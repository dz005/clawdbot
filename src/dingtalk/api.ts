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
 * Download file from DingTalk using downloadCode
 */
export async function downloadDingTalkFile(params: {
  accessToken: string;
  downloadCode: string;
  robotCode: string;
}): Promise<Buffer> {
  const url = "https://api.dingtalk.com/v1.0/robot/messageFiles/download";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-acs-dingtalk-access-token": params.accessToken,
    },
    body: JSON.stringify({
      downloadCode: params.downloadCode,
      robotCode: params.robotCode,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to download DingTalk file: ${response.status} ${text}`);
  }

  // Check if response is JSON (contains downloadUrl) or binary data
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    // Response is JSON with downloadUrl, need to fetch the actual file
    const json = (await response.json()) as { downloadUrl: string };
    const fileResponse = await fetch(json.downloadUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file from URL: ${fileResponse.status}`);
    }
    const arrayBuffer = await fileResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } else {
    // Response is the file itself
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
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

/**
 * Upload media file to DingTalk and get mediaId
 */
export async function uploadDingTalkMedia(params: {
  accessToken: string;
  type: "image" | "voice" | "video" | "file";
  media: Buffer;
  fileName?: string;
}): Promise<string> {
  // Type parameter goes in URL query string
  const url = `https://oapi.dingtalk.com/media/upload?access_token=${params.accessToken}&type=${params.type}`;

  // Create form data using native FormData
  const FormData = (await import("formdata-node")).FormData;
  const { File } = await import("node:buffer");

  const formData = new FormData();

  // Determine content type based on file extension
  let contentType = "application/octet-stream";
  const fileName = params.fileName || "file";
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "jpg" || ext === "jpeg") {
    contentType = "image/jpeg";
  } else if (ext === "png") {
    contentType = "image/png";
  } else if (ext === "gif") {
    contentType = "image/gif";
  } else if (ext === "mp4") {
    contentType = "video/mp4";
  } else if (ext === "pdf") {
    contentType = "application/pdf";
  }

  // Create a File object with proper content type
  const file = new File([new Uint8Array(params.media)], fileName, { type: contentType });
  formData.append("media", file);

  const response = await fetch(url, {
    method: "POST",
    body: formData as any,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to upload DingTalk media: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { media_id: string; created_at: string };
  return data.media_id;
}
