## 消息渠道设置

Clawdbot 支持 20+ 消息平台。以下是主要渠道的配置方法。

### WhatsApp

WhatsApp 是最常用的渠道，支持两种模式：

#### 模式 1: Dedicated（专用浏览器，推荐）

```bash
# 1. 配置 WhatsApp
clawdbot config set channels.whatsapp.mode "dedicated"
clawdbot config set channels.whatsapp.dmPolicy "pairing"

# 2. 启动网关
clawdbot gateway start

# 3. 登录 WhatsApp Web
clawdbot whatsapp login

# 4. 扫描二维码完成登录
```

**配置选项：**

```json5
{
  "channels": {
    "whatsapp": {
      "mode": "dedicated",        // 使用专用浏览器实例
      "dmPolicy": "pairing",      // DM 配对策略
      "sessionPath": "~/.clawdbot/sessions/whatsapp",
      "headless": true,           // 无头模式
      "userAgent": "custom-ua"    // 自定义 User-Agent（可选）
    }
  }
}
```

#### 模式 2: Shared（共享浏览器）

使用现有的 Chrome/Brave 浏览器实例：

```bash
# 1. 启动浏览器调试模式
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222

# 2. 配置 Clawdbot
clawdbot config set channels.whatsapp.mode "shared"
clawdbot config set channels.whatsapp.debugPort 9222

# 3. 在浏览器中手动登录 WhatsApp Web
# 4. 重启网关
clawdbot gateway restart
```

#### WhatsApp 命令

```bash
# 查看状态
clawdbot whatsapp status

# 登录
clawdbot whatsapp login

# 登出
clawdbot whatsapp logout

# 重启
clawdbot whatsapp restart

# 发送消息
clawdbot message send --to "whatsapp:+1234567890" --text "Hello"

# 发送图片
clawdbot message send --to "whatsapp:+1234567890" --image ./photo.jpg --caption "Check this out"
```

---

### Telegram

Telegram Bot 配置简单，功能强大。

#### 设置步骤

```bash
# 1. 创建 Bot
# 在 Telegram 中找到 @BotFather
# 发送 /newbot 并按提示操作
# 获取 Bot Token（格式：123456789:ABCdefGHIjklMNOpqrsTUVwxyz）

# 2. 配置 Token
clawdbot config set channels.telegram.token "YOUR_BOT_TOKEN"

# 3. 配置 DM 策略
clawdbot config set channels.telegram.dmPolicy "pairing"

# 4. 重启网关
clawdbot gateway restart

# 5. 在 Telegram 中向 Bot 发送 /start
```

#### 配置选项

```json5
{
  "channels": {
    "telegram": {
      "token": "${TELEGRAM_BOT_TOKEN}",
      "dmPolicy": "pairing",           // "pairing", "allowlist", "open"
      "allowlist": [123456789],        // 白名单用户 ID（dmPolicy=allowlist 时）
      "webhookUrl": null,              // Webhook URL（可选）
      "allowedUpdates": ["message", "callback_query"]
    }
  }
}
```

#### Telegram 命令

```bash
# 查看状态
clawdbot telegram status

# 获取 Bot 信息
clawdbot telegram info

# 发送消息
clawdbot message send --to "telegram:123456789" --text "Hello"

# 发送文件
clawdbot message send --to "telegram:123456789" --file ./document.pdf
```

#### Telegram 特性

- ✅ 文本、图片、文件、语音消息
- ✅ Markdown 格式
- ✅ 内联按钮
- ✅ 群组支持
- ✅ 命令菜单
- ✅ Webhook 模式

---

### Discord

Discord Bot 支持服务器和 DM。

#### 设置步骤

```bash
# 1. 创建 Discord Application
# 访问 https://discord.com/developers/applications
# 点击 "New Application"
# 进入 Bot 标签页，点击 "Add Bot"
# 复制 Bot Token

# 2. 配置权限
# 在 OAuth2 > URL Generator 中选择：
# - Scopes: bot, applications.commands
# - Bot Permissions: Send Messages, Read Messages, Attach Files

# 3. 配置 Clawdbot
clawdbot config set channels.discord.token "YOUR_BOT_TOKEN"
clawdbot config set channels.discord.dmPolicy "pairing"

# 4. 重启网关
clawdbot gateway restart

# 5. 使用生成的 OAuth URL 邀请 Bot 到服务器
```

#### 配置选项

```json5
{
  "channels": {
    "discord": {
      "token": "${DISCORD_BOT_TOKEN}",
      "dmPolicy": "allowlist",
      "allowlist": ["user_id_1", "user_id_2"],
      "intents": ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
      "prefix": "!"                    // 命令前缀
    }
  }
}
```

#### Discord 命令

```bash
# 查看状态
clawdbot discord status

# 发送消息
clawdbot message send --to "discord:USER_ID" --text "Hello"

# 发送到频道
clawdbot message send --to "discord:CHANNEL_ID" --text "Announcement"
```

---

### Slack

Slack 集成支持工作区和 DM。

#### 设置步骤

```bash
# 1. 创建 Slack App
# 访问 https://api.slack.com/apps
# 点击 "Create New App" > "From scratch"
# 选择工作区

# 2. 配置权限
# OAuth & Permissions > Scopes:
# - chat:write
# - chat:write.public
# - files:write
# - im:history
# - im:read
# - im:write

# 3. 安装到工作区
# 点击 "Install to Workspace"
# 复制 Bot User OAuth Token（xoxb-...）

# 4. 配置 Clawdbot
clawdbot config set channels.slack.token "xoxb-YOUR-TOKEN"

# 5. 启用 Event Subscriptions（可选）
# 配置 Request URL: https://your-gateway/slack/events
# 订阅事件: message.im, app_mention

# 6. 重启网关
clawdbot gateway restart
```

#### 配置选项

```json5
{
  "channels": {
    "slack": {
      "token": "${SLACK_BOT_TOKEN}",
      "signingSecret": "${SLACK_SIGNING_SECRET}",
      "dmPolicy": "pairing",
      "appToken": "${SLACK_APP_TOKEN}"  // Socket Mode（可选）
    }
  }
}
```

---

### Signal

Signal 通过 signal-cli 集成。

#### 设置步骤

```bash
# 1. 安装 signal-cli
# macOS
brew install signal-cli

# Linux
# 参考 https://github.com/AsamK/signal-cli

# 2. 注册号码
signal-cli -u +1234567890 register

# 3. 验证
signal-cli -u +1234567890 verify CODE

# 4. 配置 Clawdbot
clawdbot config set channels.signal.number "+1234567890"
clawdbot config set channels.signal.dmPolicy "pairing"

# 5. 重启网关
clawdbot gateway restart
```

#### 配置选项

```json5
{
  "channels": {
    "signal": {
      "number": "+1234567890",
      "dmPolicy": "pairing",
      "signalCliPath": "/usr/local/bin/signal-cli"
    }
  }
}
```

---

### iMessage（仅 macOS）

iMessage 集成需要 macOS 和 AppleScript 权限。

#### 设置步骤

```bash
# 1. 确保 iMessage 已登录
# 2. 授予终端完全磁盘访问权限
# System Settings > Privacy & Security > Full Disk Access > 添加 Terminal

# 3. 配置 Clawdbot
clawdbot config set channels.imessage.enabled true
clawdbot config set channels.imessage.dmPolicy "allowlist"
clawdbot config set channels.imessage.allowlist '["user@icloud.com"]'

# 4. 重启网关
clawdbot gateway restart
```

---

### 其他渠道

Clawdbot 还支持以下渠道（通过扩展）：

- **Microsoft Teams** (`extensions/msteams`)
- **Matrix** (`extensions/matrix`)
- **Zalo** (`extensions/zalo`)
- **Voice Call** (`extensions/voice-call`)
- **Web UI** (内置)

查看扩展文档：

```bash
ls extensions/
cat extensions/msteams/README.md
```

---

### DM 策略说明

所有渠道都支持三种 DM（私信）策略：

1. **pairing（配对，推荐）**
   - 用户首次发送消息时需要配对
   - 配对后可以正常对话
   - 最安全的选项

2. **allowlist（白名单）**
   - 只有白名单中的用户可以发送消息
   - 需要手动维护白名单

3. **open（开放）**
   - 任何人都可以发送消息
   - ⚠️ 不推荐用于生产环境

配置示例：

```bash
# 设置配对模式
clawdbot config set channels.telegram.dmPolicy "pairing"

# 设置白名单模式
clawdbot config set channels.discord.dmPolicy "allowlist"
clawdbot config set channels.discord.allowlist '["user_id_1", "user_id_2"]'

# 设置开放模式（不推荐）
clawdbot config set channels.slack.dmPolicy "open"
```

---

### 渠道状态检查

```bash
# 查看所有渠道状态
clawdbot channels status

# 深度探测（包括连接测试）
clawdbot channels status --deep

# 查看特定渠道
clawdbot telegram status
clawdbot whatsapp status
clawdbot discord status
```

---

