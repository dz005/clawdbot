## 网关管理

网关是 Clawdbot 的核心组件，负责处理所有消息路由、代理管理和渠道连接。

### 网关架构

```
┌─────────────────────────────────────────────────────────┐
│                      Clawdbot Gateway                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   WhatsApp   │  │   Telegram   │  │   Discord    │ │
│  │   Channel    │  │   Channel    │  │   Channel    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼────────┐                   │
│                    │  Message Router │                   │
│                    └───────┬────────┘                   │
│                            │                             │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │          │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐ │
│  │   Agent 1    │  │   Agent 2    │  │   Agent 3    │ │
│  │  (Workspace) │  │  (Workspace) │  │  (Workspace) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 网关模式

#### 1. Local（本地模式，推荐）

网关运行在本地机器上，适合个人使用。

```json5
{
  "gateway": {
    "mode": "local",
    "bind": "loopback",  // 只监听 127.0.0.1
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "your-secure-token"
    }
  }
}
```

**优点：**
- 最高安全性
- 无需公网 IP
- 低延迟
- 完全控制

**缺点：**
- 需要本地运行
- 移动设备访问需要 VPN/Tailscale

#### 2. Remote（远程模式）

网关运行在远程服务器上，通过 WebSocket 连接。

```json5
{
  "gateway": {
    "mode": "remote",
    "url": "wss://your-gateway.example.com",
    "auth": {
      "mode": "token",
      "token": "your-secure-token"
    }
  }
}
```

**优点：**
- 随时随地访问
- 多设备共享
- 高可用性

**缺点：**
- 需要服务器
- 网络延迟
- 安全性依赖服务器配置

#### 3. Hybrid（混合模式）

本地网关 + Tailscale 远程访问。

```json5
{
  "gateway": {
    "mode": "local",
    "bind": "tailscale",  // 绑定到 Tailscale 接口
    "port": 18789
  }
}
```

**优点：**
- 安全的远程访问
- 无需公网 IP
- 点对点加密

**缺点：**
- 需要 Tailscale 账号
- 设备需要在同一 Tailnet

---

### 网关绑定模式

#### loopback（本地回环）

只监听 `127.0.0.1`，最安全。

```bash
clawdbot gateway run --bind loopback
```

适用场景：
- 单机使用
- 开发测试
- 最高安全要求

#### lan（局域网）

监听所有网络接口（`0.0.0.0`），局域网内可访问。

```bash
clawdbot gateway run --bind lan
```

适用场景：
- 家庭网络内多设备访问
- 办公室内部使用

⚠️ **安全提示**：确保启用认证，避免未授权访问。

#### tailscale（Tailscale VPN）

绑定到 Tailscale 虚拟网络接口。

```bash
# 1. 安装 Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# 2. 登录
sudo tailscale up

# 3. 启动网关
clawdbot gateway run --bind tailscale
```

适用场景：
- 安全的远程访问
- 多地点设备连接
- 团队协作

#### public（公网）

监听公网 IP，需要配置防火墙和 HTTPS。

```bash
clawdbot gateway run --bind public --port 443
```

适用场景：
- 公开服务
- Webhook 接收

⚠️ **安全提示**：
- 必须使用 HTTPS
- 强制启用认证
- 配置速率限制
- 使用防火墙

---

### 网关认证

#### Token 认证（推荐）

使用固定 token 进行认证。

```json5
{
  "gateway": {
    "auth": {
      "mode": "token",
      "token": "your-secure-random-token-here"
    }
  }
}
```

生成安全 token：

```bash
# 方式 1: OpenSSL
openssl rand -hex 32

# 方式 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 方式 3: Clawdbot 内置
clawdbot gateway generate-token
```

#### OAuth 认证

使用 OAuth 2.0 进行认证（适合团队）。

```json5
{
  "gateway": {
    "auth": {
      "mode": "oauth",
      "provider": "github",
      "clientId": "${OAUTH_CLIENT_ID}",
      "clientSecret": "${OAUTH_CLIENT_SECRET}",
      "allowedUsers": ["username1", "username2"]
    }
  }
}
```

#### 无认证（仅开发）

⚠️ **危险**：仅用于本地开发测试。

```json5
{
  "gateway": {
    "auth": {
      "mode": "none"
    }
  }
}
```

---

### 网关启动和管理

#### 前台运行（调试）

```bash
# 基础启动
clawdbot gateway run

# 指定端口和绑定
clawdbot gateway run --bind loopback --port 18789

# 详细日志
clawdbot gateway run --log-level debug

# 强制启动（杀死现有实例）
clawdbot gateway run --force
```

#### 后台运行（生产）

```bash
# 启动
clawdbot gateway start

# 查看状态
clawdbot gateway status

# 查看日志
clawdbot gateway logs --follow

# 停止
clawdbot gateway stop

# 重启
clawdbot gateway restart
```

#### macOS 菜单栏应用

macOS 用户推荐使用菜单栏应用：

1. 下载并安装 Clawdbot.app
2. 启动应用，网关自动运行
3. 点击菜单栏图标管理网关
4. 应用会在登录时自动启动

---

### 网关配置选项

#### 完整配置示例

```json5
{
  "gateway": {
    // 基础配置
    "mode": "local",
    "bind": "loopback",
    "port": 18789,

    // 认证
    "auth": {
      "mode": "token",
      "token": "${GATEWAY_TOKEN}"
    },

    // 性能
    "workers": 4,                    // 工作进程数
    "maxConnections": 1000,          // 最大连接数
    "timeout": 30000,                // 超时时间（毫秒）

    // 日志
    "logging": {
      "level": "info",               // debug, info, warn, error
      "file": "~/.clawdbot/gateway.log",
      "maxSize": "100MB",
      "maxFiles": 10
    },

    // CORS（跨域）
    "cors": {
      "enabled": true,
      "origins": ["https://app.example.com"],
      "credentials": true
    },

    // 速率限制
    "rateLimit": {
      "enabled": true,
      "windowMs": 60000,             // 时间窗口（毫秒）
      "maxRequests": 100             // 最大请求数
    },

    // WebSocket
    "websocket": {
      "pingInterval": 30000,         // 心跳间隔
      "pingTimeout": 5000,           // 心跳超时
      "maxPayload": 10485760         // 最大消息大小（10MB）
    },

    // SSL/TLS（公网模式）
    "ssl": {
      "enabled": false,
      "cert": "/path/to/cert.pem",
      "key": "/path/to/key.pem",
      "ca": "/path/to/ca.pem"
    }
  }
}
```

---

### 网关监控

#### 实时状态

```bash
# 基础状态
clawdbot gateway status

# JSON 输出
clawdbot gateway status --json

# 持续监控
clawdbot gateway status --watch
```

输出示例：

```
Gateway Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:        Running
Mode:          local
Bind:          loopback (127.0.0.1)
Port:          18789
Uptime:        2d 5h 32m
Version:       2026.1.24

Connections:   12 active
Agents:        3 running
Channels:      5 connected
Memory:        245 MB
CPU:           2.3%

Channels:
  ✓ WhatsApp   Connected (2 chats)
  ✓ Telegram   Connected (5 chats)
  ✓ Discord    Connected (3 servers)
  ✗ Slack      Disconnected
  ✓ Signal     Connected (1 chat)
```

#### 日志监控

```bash
# 实时日志
clawdbot gateway logs --follow

# 过滤错误
clawdbot gateway logs --level error

# 搜索关键词
clawdbot gateway logs --grep "WhatsApp"

# 最近 500 行
clawdbot gateway logs --lines 500
```

#### 性能监控

```bash
# 性能统计
clawdbot stats performance

# 按时间段
clawdbot stats performance --period day

# JSON 输出（用于监控系统）
clawdbot stats performance --json
```

---

### 网关故障排查

#### 常见问题

**1. 网关无法启动**

```bash
# 检查端口占用
lsof -i :18789
netstat -an | grep 18789

# 强制停止旧实例
clawdbot gateway stop --force

# 使用不同端口
clawdbot gateway run --port 18790
```

**2. 渠道连接失败**

```bash
# 检查渠道状态
clawdbot channels status --deep

# 查看详细日志
clawdbot gateway logs --grep "WhatsApp" --level error

# 重启特定渠道
clawdbot whatsapp restart
```

**3. 内存占用过高**

```bash
# 查看内存使用
clawdbot gateway status

# 清理旧会话
clawdbot cleanup --sessions --older-than 7

# 减少工作进程
clawdbot config set gateway.workers 2
clawdbot gateway restart
```

**4. 认证失败**

```bash
# 验证 token
clawdbot config get gateway.auth.token

# 重新生成 token
clawdbot gateway generate-token

# 更新配置
clawdbot config set gateway.auth.token "new-token"
```

#### 诊断工具

```bash
# 运行完整诊断
clawdbot doctor

# 自动修复问题
clawdbot doctor --fix

# 详细输出
clawdbot doctor --verbose
```

---

### 网关部署

#### Docker 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  clawdbot:
    image: clawdbot/clawdbot:latest
    container_name: clawdbot-gateway
    restart: unless-stopped
    ports:
      - "18789:18789"
    volumes:
      - ./config:/root/.clawdbot
      - ./workspace:/root/clawd
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - GATEWAY_TOKEN=${GATEWAY_TOKEN}
    command: gateway run --bind lan --port 18789
```

启动：

```bash
docker-compose up -d
docker-compose logs -f
```

#### Systemd 服务（Linux）

```ini
# /etc/systemd/system/clawdbot.service
[Unit]
Description=Clawdbot Gateway
After=network.target

[Service]
Type=simple
User=clawdbot
WorkingDirectory=/home/clawdbot
ExecStart=/usr/local/bin/clawdbot gateway run --bind loopback --port 18789
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

管理服务：

```bash
# 启用服务
sudo systemctl enable clawdbot

# 启动服务
sudo systemctl start clawdbot

# 查看状态
sudo systemctl status clawdbot

# 查看日志
sudo journalctl -u clawdbot -f
```

#### LaunchAgent（macOS）

macOS 应用会自动配置 LaunchAgent，无需手动设置。

如需手动配置：

```xml
<!-- ~/Library/LaunchAgents/com.clawdbot.gateway.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.clawdbot.gateway</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/clawdbot</string>
        <string>gateway</string>
        <string>run</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

加载：

```bash
launchctl load ~/Library/LaunchAgents/com.clawdbot.gateway.plist
launchctl start com.clawdbot.gateway
```

---

### 网关安全最佳实践

1. **始终启用认证**：即使在本地环境
2. **使用强 token**：至少 32 字节随机字符
3. **限制绑定范围**：优先使用 `loopback` 或 `tailscale`
4. **启用 HTTPS**：公网部署必须使用 SSL/TLS
5. **配置速率限制**：防止滥用
6. **定期更新**：保持 Clawdbot 最新版本
7. **监控日志**：及时发现异常
8. **备份配置**：定期导出配置和数据
9. **最小权限原则**：只授予必要的权限
10. **使用防火墙**：限制访问来源

---

