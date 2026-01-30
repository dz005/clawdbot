# Clawdbot 用户手册

> 完整的安装、配置和使用指南

## 目录

1. [简介](#简介)
2. [系统要求](#系统要求)
3. [安装](#安装)
4. [快速开始](#快速开始)
5. [配置](#配置)
6. [消息渠道设置](#消息渠道设置)
7. [模型配置](#模型配置)
8. [CLI 命令参考](#cli-命令参考)
9. [网关管理](#网关管理)
10. [高级功能](#高级功能)
11. [故障排查](#故障排查)
12. [常见问题](#常见问题)

---

## 简介

Clawdbot 是一个强大的 AI 助手平台，支持通过多种消息渠道（WhatsApp、Telegram、Discord、Slack 等）与 AI 模型交互。它采用 WebSocket 网关架构，支持多代理路由、会话管理、浏览器控制等高级功能。

### 核心特性

- **多渠道支持**：20+ 消息平台（WhatsApp、Telegram、Discord、Slack、Signal、iMessage 等）
- **多模型支持**：Anthropic Claude、OpenAI GPT、MiniMax、GLM、Moonshot 等
- **多代理架构**：独立工作空间、会话隔离、智能路由
- **安全机制**：DM 配对、白名单、沙箱隔离
- **高级功能**：浏览器控制、Canvas 渲染、语音唤醒、自动化任务
- **跨平台**：macOS、Linux、Windows（WSL2）、Docker、树莓派

---

## 系统要求

### 基础要求

- **Node.js**: ≥ 22.0.0（推荐使用最新 LTS 版本）
- **操作系统**:
  - macOS 12+ (推荐，支持菜单栏应用)
  - Linux (Ubuntu 20.04+, Debian 11+, 或其他主流发行版)
  - Windows 10/11 (通过 WSL2)
- **内存**: 最低 2GB RAM，推荐 4GB+
- **磁盘空间**: 至少 500MB 可用空间

### 可选要求

- **Brave Search API Key**: 用于网络搜索功能
- **Tailscale**: 用于远程访问网关
- **Docker**: 用于容器化部署
- **GPU**: 本地模型推理（需要高性能 GPU，如 24GB+ VRAM）

---

## 安装

### 方法 1: 安装脚本（推荐）

这是最简单的安装方式，适用于 macOS 和 Linux。

```bash
# macOS / Linux
curl -fsSL https://clawd.bot/install.sh | bash
```

安装脚本会自动：
- 检测系统环境
- 安装 Node.js（如果需要）
- 全局安装 clawdbot
- 配置 PATH 环境变量
- 运行初始化向导

### 方法 2: npm/pnpm 全局安装

```bash
# 使用 npm
npm install -g clawdbot

# 使用 pnpm（推荐）
pnpm add -g clawdbot

# 验证安装
clawdbot --version
```

### 方法 3: 从源码安装

适合开发者或需要最新功能的用户。

```bash
# 克隆仓库
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot

# 安装依赖
pnpm install

# 构建
pnpm build

# 链接到全局
pnpm link --global

# 验证
clawdbot --version
```

### 方法 4: Docker 部署

```bash
# 拉取镜像
docker pull clawdbot/clawdbot:latest

# 使用 Docker Compose
curl -fsSL https://raw.githubusercontent.com/clawdbot/clawdbot/main/docker-compose.yml -o docker-compose.yml
docker-compose up -d
```

### 方法 5: macOS 应用

下载 macOS 菜单栏应用（包含网关）：

```bash
# 下载最新版本
curl -fsSL https://clawd.bot/install-mac.sh | bash
```

或从 GitHub Releases 页面手动下载 `.dmg` 文件。

---

## 快速开始

### 第一步：运行初始化向导

安装完成后，运行初始化向导进行基础配置：

```bash
clawdbot onboard
```

向导会引导你完成：

1. **模式选择**
   - QuickStart（快速开始）：使用默认配置
   - Advanced（高级）：自定义所有选项

2. **模型配置**
   - 选择主要模型提供商（Anthropic、OpenAI、MiniMax 等）
   - 输入 API 密钥
   - 配置备用模型

3. **工作空间设置**
   - 设置工作目录（默认 `~/clawd`）
   - 配置会话存储位置

4. **网关配置**
   - 选择网关模式（本地/远程）
   - 配置绑定地址和端口
   - 设置认证方式

5. **消息渠道**
   - 选择要启用的渠道（WhatsApp、Telegram 等）
   - 配置渠道凭据

### ���二步：启动网关

```bash
# 启动网关（前台运行）
clawdbot gateway run

# 后台运行（推荐）
clawdbot gateway start

# 查看网关状态
clawdbot gateway status
```

### 第三步：配置消息渠道

以 Telegram 为例：

```bash
# 1. 在 Telegram 中创建 Bot
# 访问 @BotFather，发送 /newbot，获取 token

# 2. 配置 token
clawdbot config set channels.telegram.token "YOUR_BOT_TOKEN"

# 3. 重启网关
clawdbot gateway restart

# 4. 在 Telegram 中向你的 Bot 发送消息测试
```

### 第四步：发送第一条消息

```bash
# 通过 CLI 发送测试消息
clawdbot message send --to "telegram:YOUR_USER_ID" --text "Hello, Clawdbot!"

# 或直接在 Telegram 中向 Bot 发送消息
```

---

## 配置

### 配置文件位置

主配置文件：`~/.clawdbot/clawdbot.json`

配置文件使用 JSON5 格式（支持注释、尾随逗号等）。

### 配置文件结构

```json5
{
  // 环境变量
  "env": {
    "vars": {
      "ANTHROPIC_API_KEY": "sk-ant-...",
      "OPENAI_API_KEY": "sk-..."
    }
  },

  // 代理默认配置
  "agents": {
    "defaults": {
      "workspace": "~/clawd",
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["anthropic/claude-opus-4-5"]
      },
      "models": {
        "anthropic/claude-sonnet-4-5": { "alias": "sonnet" },
        "anthropic/claude-opus-4-5": { "alias": "opus" }
      }
    }
  },

  // 模型提供商配置
  "models": {
    "mode": "merge",  // "merge" 或 "replace"
    "providers": {
      // 自定义提供商配置
    }
  },

  // 网关配置
  "gateway": {
    "mode": "local",
    "bind": "loopback",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "your-secure-token"
    }
  },

  // 消息渠道配置
  "channels": {
    "telegram": {
      "token": "${TELEGRAM_BOT_TOKEN}",
      "dmPolicy": "pairing"
    },
    "discord": {
      "token": "${DISCORD_BOT_TOKEN}",
      "dmPolicy": "allowlist"
    },
    "whatsapp": {
      "mode": "dedicated",
      "dmPolicy": "pairing"
    }
  },

  // 安全配置
  "security": {
    "sandbox": {
      "enabled": true,
      "mode": "docker"
    }
  }
}
```

### 使用 CLI 修改配置

```bash
# 查看配置
clawdbot config get

# 设置单个值
clawdbot config set gateway.port 18789

# 使用点号访问嵌套属性
clawdbot config set agents.defaults.model.primary "anthropic/claude-sonnet-4-5"

# 使用括号访���数组
clawdbot config set agents.defaults.model.fallbacks[0] "anthropic/claude-opus-4-5"

# 删除配置项
clawdbot config unset channels.telegram.token

# 交互式配置向导
clawdbot configure
```

---

