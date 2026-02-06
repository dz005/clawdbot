## 常见问题 (FAQ)

### 基础问题

#### Q: Clawdbot 是什么？

A: Clawdbot 是一个开源的 AI 助手平台，允许你通过多种消息渠道（WhatsApp、Telegram、Discord 等）与 AI 模型交互。它支持多代理架构、浏览器控制、Canvas 渲染等高级功能。

#### Q: Clawdbot 是免费的吗？

A: Clawdbot 软件本身是开源免费的，但使用 AI 模型需要 API 密钥，这些服务通常是付费的（如 Anthropic Claude、OpenAI GPT）。你也可以使用本地模型（Ollama、LM Studio）来避免 API 费用。

#### Q: 支持哪些操作系统？

A:
- **macOS**: 完全支持，包括菜单栏应用
- **Linux**: 完全支持（Ubuntu、Debian、Fedora 等）
- **Windows**: 通过 WSL2 支持
- **Docker**: 跨平台容器化部署

#### Q: 需要什么硬件配置？

A:
- **最低配置**: 2GB RAM, 500MB 磁盘空间
- **推荐配置**: 4GB+ RAM, 1GB 磁盘空间
- **本地模型**: 24GB+ VRAM GPU（用于运行大型模型）

---

### 安装和配置

#### Q: 如何安装 Clawdbot？

A: 最简单的方式是使用安装脚本：

```bash
curl -fsSL https://clawd.bot/install.sh | bash
```

或使用 npm/pnpm：

```bash
npm install -g clawdbot
# 或
pnpm add -g clawdbot
```

#### Q: 安装后如何开始使用？

A: 运行初始化向导：

```bash
clawdbot onboard
```

向导会引导你完成基础配置，包括模型、网关和渠道设置。

#### Q: 配置文件在哪里？

A: 主配置文件位于 `~/.clawdbot/clawdbot.json`

你可以使用以下命令编辑：

```bash
clawdbot config edit
```

#### Q: 如何更新 Clawdbot？

A:

```bash
# 使用内置更新命令
clawdbot update

# 或使用包管理器
npm update -g clawdbot
# 或
pnpm update -g clawdbot
```

---

### 模型相关

#### Q: 支持哪些 AI 模型？

A: Clawdbot 支持多种模型提供商：

- **Anthropic**: Claude 3.5 Sonnet, Claude Opus 4.5, Claude Haiku
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **中国区**: MiniMax, Moonshot (Kimi), GLM, Qwen, DeepSeek
- **本地**: Ollama, LM Studio, vLLM, LiteLLM
- **其他**: OpenRouter, GitHub Copilot, AWS Bedrock

#### Q: 如何配置 API 密钥？

A:

```bash
# 方式 1: 使用 CLI
clawdbot config set env.vars.ANTHROPIC_API_KEY "sk-ant-..."

# 方式 2: 环境变量
export ANTHROPIC_API_KEY="sk-ant-..."

# 方式 3: 编辑配置文件
clawdbot config edit
```

#### Q: 可以同时使用多个模型吗？

A: 可以。你可以配置主模型和备用模型：

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "anthropic/claude-opus-4-5",
          "openai/gpt-4-turbo"
        ]
      }
    }
  }
}
```

#### Q: 如何使用本地模型？

A:

1. 安装 Ollama 或 LM Studio
2. 启动本地服务
3. Clawdbot 会自动检测并使用

详细配置参考"模型配置"章节。

#### Q: 模型费用如何计算？

A: 不同提供商有不同的定价：

- **Anthropic Claude**: 按 token 计费（输入/输出不同价格）
- **OpenAI GPT**: 按 token 计费
- **本地模型**: 免费（但需要硬件成本）

使用 `clawdbot stats cost` 查看使用统计。

---

### 渠道相关

#### Q: 支持哪些消息渠道？

A: 20+ 渠道，包括：

**内置渠道**:
- WhatsApp
- Telegram
- Discord
- Slack
- Signal
- iMessage (macOS)
- Web UI

**扩展渠道**:
- Microsoft Teams
- Matrix
- Zalo
- Voice Call

#### Q: 如何配置 WhatsApp？

A:

```bash
# 1. 配置 WhatsApp
clawdbot config set channels.whatsapp.mode "dedicated"

# 2. 启动网关
clawdbot gateway start

# 3. 登录
clawdbot whatsapp login

# 4. 扫描二维码
```

#### Q: Telegram Bot 如何创建？

A:

1. 在 Telegram 中找到 @BotFather
2. 发送 `/newbot`
3. 按提示设置名称和用户名
4. 获取 Bot Token
5. 配置到 Clawdbot：

```bash
clawdbot config set channels.telegram.token "YOUR_TOKEN"
```

#### Q: 可以同时使用多个渠道吗？

A: 可以。Clawdbot 支持同时连接多个渠道，所有消息会路由到同一个 AI 助手。

#### Q: 如何保护隐私和安全？

A: Clawdbot 提供多层安全机制：

1. **DM 配对**: 用户首次使用需要配对
2. **白名单**: 只允许特定用户访问
3. **沙箱隔离**: 代码执行在隔离环境中
4. **本地部署**: 数据不离开你的设备
5. **加密传输**: 使用 HTTPS/WSS

---

### 网关相关

#### Q: 什么是网关？

A: 网关是 Clawdbot 的核心组件，负责：
- 管理所有消息渠道连接
- 路由消息到对应的代理
- 处理认证和安全
- 管理会话和状态

#### Q: 网关必须一直运行吗？

A: 是的。网关需要持续运行才能接收和处理消息。你可以：

- 使用 `clawdbot gateway start` 后台运行
- 使用 macOS 菜单栏应用（自动启动）
- 使用 systemd/Docker 部署（生产环境）

#### Q: 如何远程访问网关？

A: 有几种方式：

1. **Tailscale** (推荐): 安全的点对点 VPN
2. **公网部署**: 配置 HTTPS 和防火墙
3. **VPN**: 通过 VPN 访问局域网

#### Q: 网关占用多少资源？

A: 典型资源占用：
- **内存**: 100-300 MB（取决于活跃会话数）
- **CPU**: 1-5%（空闲时）
- **磁盘**: 50-200 MB（日志和会话）

---

### 使用相关

#### Q: 如何发送消息给 AI？

A: 有多种方式：

1. **通过渠道**: 在 WhatsApp/Telegram 等直接发送消息
2. **通过 CLI**: `clawdbot message send --to "telegram:123" --text "Hello"`
3. **通过 Web UI**: 访问网关 Web 界面

#### Q: 如何切换模型？

A: 在消息中使用 `@model-alias`：

```
@opus 帮我写一段复杂的代码
@haiku 快速回答这个问题
@minimax 翻译这段文字
```

或使用 CLI：

```bash
clawdbot models set anthropic/claude-opus-4-5
```

#### Q: 支持发送图片吗？

A: 支持。大多数渠道支持图片：

```bash
clawdbot message send --to "whatsapp:+1234567890" --image ./photo.jpg --caption "描述这张图片"
```

AI 会分析图片内容并回复。

#### Q: 支持语音消息吗？

A: 部分支持：
- **接收**: 支持（会转换为文本）
- **发送**: 部分渠道支持（如 Telegram）
- **语音唤醒**: macOS 支持

#### Q: 如何查看对话历史？

A:

```bash
# 查看所有历史
clawdbot message history

# 按渠道过滤
clawdbot message history --channel telegram

# 按用户过滤
clawdbot message history --user "123456789"

# 导出为 JSON
clawdbot message history --format json > history.json
```

---

### 高级功能

#### Q: 什么是多代理？

A: 多代理允许你创建多个独立的 AI 助手，每个有自己的：
- 工作空间
- 模型配置
- 会话历史
- 权限设置

适合不同场景使用不同配置。

#### Q: 如何使用浏览器控制？

A: 在对话中直接请求：

```
你: 帮我打开 GitHub 并搜索 clawdbot
AI: [自动打开浏览器并执行操作]

你: 截图当前页面
AI: [截图并发送]
```

#### Q: Canvas 功能是什么？

A: Canvas 允许 AI 生成可视化内容：
- 图表和图形
- UI 界面
- 数据可视化
- HTML/CSS 页面

#### Q: 支持自动化任务吗？

A: 支持。可以配置：
- **定时任务**: 使用 cron 表达式
- **Webhook**: 响应外部事件
- **自动备份**: 定期备份数据

#### Q: 如何集成 MCP 工具？

A: 在配置文件中添加 MCP 服务器：

```json5
{
  "mcp": {
    "enabled": true,
    "servers": {
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_TOKEN": "${GITHUB_TOKEN}"
        }
      }
    }
  }
}
```

---

### 故障排查

#### Q: 网关无法启动怎么办？

A:

```bash
# 1. 检查端口占用
lsof -i :18789

# 2. 强制停止旧实例
clawdbot gateway stop --force

# 3. 使用不同端口
clawdbot gateway run --port 18790

# 4. 查看日志
clawdbot gateway logs --level error
```

#### Q: WhatsApp 登录失败怎么办？

A:

```bash
# 1. 清理会话
rm -rf ~/.clawdbot/sessions/whatsapp

# 2. 使用非无头模式
clawdbot config set channels.whatsapp.headless false

# 3. 重新登录
clawdbot whatsapp login
```

#### Q: 模型请求失败怎么办？

A:

```bash
# 1. 检查 API 密钥
clawdbot config get env.vars.ANTHROPIC_API_KEY

# 2. 测试连接
clawdbot models test anthropic/claude-sonnet-4-5

# 3. 使用备用模型
clawdbot models set anthropic/claude-opus-4-5
```

#### Q: 如何获取帮助？

A:

1. **查看文档**: https://docs.clawd.bot
2. **运行诊断**: `clawdbot doctor`
3. **查看日志**: `clawdbot gateway logs`
4. **提交 Issue**: https://github.com/clawdbot/clawdbot/issues

---

### 最佳实践

#### Q: 推荐的配置是什么？

A:

**个人使用**:
- 模式: Local
- 绑定: Loopback
- 模型: Claude Sonnet 4.5 + Opus 4.5 备用
- 渠道: WhatsApp + Telegram
- 安全: DM 配对

**团队使用**:
- 模式: Remote (或 Tailscale)
- 绑定: LAN/Tailscale
- 模型: 多模型配置 + 本地备用
- 渠道: 多渠道支持
- 安全: 白名单 + OAuth

**开发测试**:
- 模式: Local
- 绑定: Loopback
- 模型: 本地模型 (Ollama)
- 渠道: Web UI
- 安全: Token 认证

#### Q: 如何优化性能？

A:

1. **使用更快的模型**: Haiku 比 Opus 快
2. **启用缓存**: 减少重复计算
3. **限制上下文**: 减少 token 使用
4. **本地模型**: 消除网络延迟
5. **清理旧数据**: 定期清理会话和日志

#### Q: 如何降低成本？

A:

1. **使用本地模型**: Ollama/LM Studio 免费
2. **选择经济模型**: Haiku 比 Opus 便宜
3. **限制使用**: 设置每日预算
4. **启用缓存**: 减少 API 调用
5. **监控使用**: `clawdbot stats cost`

#### Q: 如何保证数据安全？

A:

1. **本地部署**: 数据不离开设备
2. **启用加密**: 传输和存储加密
3. **定期备份**: 自动备份配置和数据
4. **访问控制**: 使用白名单和认证
5. **沙箱隔离**: 代码执行隔离

---

### 其他问题

#### Q: Clawdbot 开源吗？

A: 是的，Clawdbot 是开源项目，代码托管在 GitHub：
https://github.com/clawdbot/clawdbot

#### Q: 如何贡献代码？

A:

1. Fork 仓库
2. 创建功能分支
3. 提交 Pull Request
4. 参考 CONTRIBUTING.md

#### Q: 有社区支持吗？

A: 有，你可以通过以下渠道获取帮助：
- GitHub Issues
- GitHub Discussions
- Discord 社区
- Stack Overflow (标签: clawdbot)

#### Q: 商业使用需要授权吗？

A: Clawdbot 使用开源许可证，允许商业使用。但请注意：
- 遵守许可证条款
- AI 模型 API 需要单独付费
- 某些功能可能有使用限制

#### Q: 未来会有哪些新功能？

A: 查看 GitHub 的 Roadmap 和 Issues 了解开发计划。常见的计划功能包括：
- 更多渠道支持
- 增强的多模态能力
- 更好的团队协作功能
- 性能优化
- 更多集成选项

---

## 总结

本用户手册涵盖了 Clawdbot 的安装、配置、使用和故障排查。如果你有其他问题：

1. 查看在线文档: https://docs.clawd.bot
2. 搜索 GitHub Issues
3. 加入社区讨论
4. 提交新的 Issue

祝你使用愉快！🎉

---

**相关资源**

- 官网: https://clawd.bot
- 文档: https://docs.clawd.bot
- GitHub: https://github.com/clawdbot/clawdbot
- Discord: [加入社区]
- Twitter: [@clawdbot]

**版本信息**

本手册基于 Clawdbot 2026.1.24 版本编写。

