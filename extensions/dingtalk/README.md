# DingTalk Channel for Clawdbot

DingTalk channel plugin with Stream mode support (no public IP required).

## Features

- **Stream Mode**: Uses WebSocket connection, no need to expose public endpoints
- **Private Chat**: Supports one-on-one conversations with users
- **Simple Setup**: Just configure credentials and start

## Configuration

Add the following to your `~/.clawdbot/config.json`:

```json
{
  "channels": {
    "dingtalk": {
      "clientId": "your-client-id",
      "clientSecret": "your-client-secret",
      "robotCode": "your-robot-code"
    }
  }
}
```

Or use environment variables:

```bash
export DINGTALK_CLIENT_ID="your-client-id"
export DINGTALK_CLIENT_SECRET="your-client-secret"
export DINGTALK_ROBOT_CODE="your-robot-code"
```

### Multiple Accounts

You can configure multiple DingTalk accounts:

```json
{
  "channels": {
    "dingtalk": {
      "defaultAccount": "work",
      "accounts": {
        "work": {
          "enabled": true,
          "clientId": "work-client-id",
          "clientSecret": "work-client-secret",
          "robotCode": "work-robot-code"
        },
        "personal": {
          "enabled": false,
          "clientId": "personal-client-id",
          "clientSecret": "personal-client-secret",
          "robotCode": "personal-robot-code"
        }
      }
    }
  }
}
```

## Getting Credentials

1. Go to [DingTalk Open Platform](https://open.dingtalk.com/)
2. Create an enterprise internal application or third-party application
3. Enable the robot capability
4. Get your credentials:
   - **Client ID** (AppKey): Found in application details
   - **Client Secret** (AppSecret): Found in application details
   - **Robot Code**: Found in robot configuration

## Stream Mode Setup

1. In your DingTalk application settings, enable **Stream Mode** for event subscriptions
2. Subscribe to the **Robot Message** event (`TOPIC_ROBOT`)
3. No need to configure callback URLs - Stream mode uses WebSocket

## Usage

### Start the Gateway

```bash
clawdbot gateway run
```

The DingTalk channel will automatically connect via Stream mode.

### Send Messages

Users can send messages to your robot in DingTalk, and the bot will respond.

### Check Status

```bash
clawdbot channels status
```

## Limitations

- Currently only supports **private chat** (one-on-one conversations)
- No support for group chats yet
- No support for rich media (images, files) yet
- No support for interactive cards yet

## Troubleshooting

### Connection Issues

If the Stream client fails to connect:

1. Verify your credentials are correct
2. Check that Stream mode is enabled in DingTalk application settings
3. Ensure the robot has the necessary permissions

### Message Not Received

1. Make sure the robot is subscribed to the `TOPIC_ROBOT` event
2. Check that the user has added the robot as a contact
3. Verify the robot is enabled in your application

## API Reference

### Send Message

```typescript
import { sendMessageDingTalk } from "clawdbot";

await sendMessageDingTalk({
  userId: "user-staff-id",
  text: "Hello from Clawdbot!",
});
```

### Send Markdown

```typescript
import { sendMarkdownDingTalk } from "clawdbot";

await sendMarkdownDingTalk({
  userId: "user-staff-id",
  title: "Notification",
  text: "**Bold** and *italic* text",
});
```

## Development

The DingTalk channel is implemented as a Clawdbot plugin:

- Core implementation: `src/dingtalk/`
- Plugin registration: `extensions/dingtalk/`

## License

MIT
