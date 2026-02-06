## 高级功能

Clawdbot 提供了许多高级功能，帮助你构建强大的 AI 工作流。

### 浏览器控制

Clawdbot 可以控制浏览器进行自动化操作。

#### 启用浏览器控制

```json5
{
  "browser": {
    "enabled": true,
    "headless": true,           // 无头模式
    "executablePath": null,     // 自动检测浏览器
    "userDataDir": "~/.clawdbot/browser-data",
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

#### 使用示例

在对话中请求浏览器操作：

```
你: 帮我打开 GitHub 并搜索 clawdbot
AI: [打开浏览器，导航到 GitHub，执行搜索]

你: 截图当前页面
AI: [截图并发送]

你: 点击第一个搜索结果
AI: [点击链接并导航]
```

#### 浏览器命令

```bash
# 打开浏览器
clawdbot browser open

# 导航到 URL
clawdbot browser navigate --url "https://example.com"

# 截图
clawdbot browser screenshot --output screenshot.png

# 执行 JavaScript
clawdbot browser eval "document.title"

# 关闭浏览器
clawdbot browser close
```

---

### Canvas 渲染

Canvas 功能允许 AI 生成可视化内容（图表、图形、UI 等）。

#### 启用 Canvas

```json5
{
  "canvas": {
    "enabled": true,
    "renderer": "a2ui",         // 使用 A2UI 渲染器
    "outputDir": "~/clawd/canvas",
    "formats": ["png", "pdf", "html"]
  }
}
```

#### 使用示例

```
你: 画一个饼图显示我的时间分配
AI: [生成饼图并发送图片]

你: 创建一个登录页面的 UI
AI: [生成 HTML/CSS 并渲染预览]

你: 可视化这组数据：[1, 5, 3, 8, 2]
AI: [生成柱状图]
```

#### Canvas 配置

```json5
{
  "canvas": {
    "enabled": true,
    "renderer": "a2ui",
    "width": 1200,
    "height": 800,
    "dpi": 144,
    "theme": "light",           // light, dark, auto
    "fonts": {
      "sans": "Inter",
      "mono": "JetBrains Mono"
    }
  }
}
```

---

### 语音唤醒

macOS 用户可以使用语音唤醒功能。

#### 设置语音唤醒

```bash
# 1. 配置唤醒词
clawdbot config set voice.wakeWord "Hey Clawdbot"

# 2. 配置转发命令
clawdbot config set voice.forwardCommand "clawdbot-mac agent --message \"\${text}\" --thinking low"

# 3. 启用语音唤醒
clawdbot config set voice.enabled true

# 4. 重启网关
clawdbot gateway restart
```

#### 配置选项

```json5
{
  "voice": {
    "enabled": true,
    "wakeWord": "Hey Clawdbot",
    "language": "en-US",
    "forwardCommand": "clawdbot-mac agent --message \"${text}\" --thinking low",
    "feedback": {
      "sound": true,
      "visual": true
    }
  }
}
```

#### 使用

1. 说出唤醒词："Hey Clawdbot"
2. 听到提示音后说出指令
3. AI 处理并响应

---

### 多代理路由

Clawdbot 支持多个独立代理，每个代理有自己的工作空间和配置。

#### 创建多个代理

```bash
# 代理 1: 编码助手
clawdbot agent create \
  --name "Code Assistant" \
  --workspace ~/projects \
  --model anthropic/claude-opus-4-5 \
  --profile coding

# 代理 2: 写作助手
clawdbot agent create \
  --name "Writing Assistant" \
  --workspace ~/documents \
  --model anthropic/claude-sonnet-4-5 \
  --profile writing

# 代理 3: 数据分析
clawdbot agent create \
  --name "Data Analyst" \
  --workspace ~/data \
  --model openai/gpt-4-turbo \
  --profile analysis
```

#### 路由规则

```json5
{
  "routing": {
    "rules": [
      {
        "name": "Code questions to Opus",
        "condition": {
          "messageContains": ["code", "bug", "function", "class"]
        },
        "action": {
          "agent": "code-assistant"
        }
      },
      {
        "name": "Writing to Sonnet",
        "condition": {
          "messageContains": ["write", "draft", "essay", "article"]
        },
        "action": {
          "agent": "writing-assistant"
        }
      },
      {
        "name": "Data questions to GPT-4",
        "condition": {
          "messageContains": ["data", "analyze", "chart", "statistics"]
        },
        "action": {
          "agent": "data-analyst"
        }
      }
    ],
    "default": "code-assistant"
  }
}
```

#### 手动切换代理

在消息中使用 `@agent-name` 切换：

```
你: @writing-assistant 帮我写一篇关于 AI 的文章
AI: [使用 writing-assistant 代理响应]

你: @code-assistant 这段代码有什么问题？
AI: [使用 code-assistant 代理响应]
```

---

### 工具和插件

Clawdbot 支持自定义工具和插件扩展功能。

#### 内置工具

- **文件操作**: 读取、写入、搜索文件
- **命令执行**: 运行 shell 命令
- **网络请求**: HTTP/HTTPS 请求
- **数据处理**: JSON、CSV、XML 解析
- **图像处理**: 调整大小、格式转换
- **代码执行**: Python、JavaScript、Bash

#### 启用工具

```json5
{
  "tools": {
    "enabled": true,
    "allowedTools": [
      "file_read",
      "file_write",
      "bash_exec",
      "http_request",
      "python_exec"
    ],
    "sandbox": {
      "enabled": true,
      "mode": "docker"
    }
  }
}
```

#### 创建自定义工具

```javascript
// ~/.clawdbot/tools/my-tool.js
export default {
  name: "my_custom_tool",
  description: "My custom tool description",
  parameters: {
    type: "object",
    properties: {
      input: {
        type: "string",
        description: "Input parameter"
      }
    },
    required: ["input"]
  },
  async execute({ input }) {
    // 工具逻辑
    return {
      success: true,
      result: `Processed: ${input}`
    };
  }
};
```

注册工具：

```bash
clawdbot tools register ~/.clawdbot/tools/my-tool.js
clawdbot gateway restart
```

---

### 沙箱隔离

为了安全执行代码，Clawdbot 支持沙箱隔离。

#### Docker 沙箱（推荐）

```json5
{
  "security": {
    "sandbox": {
      "enabled": true,
      "mode": "docker",
      "image": "clawdbot/sandbox:latest",
      "limits": {
        "memory": "512m",
        "cpu": "1.0",
        "timeout": 30000
      },
      "network": "none"
    }
  }
}
```

#### VM 沙箱

```json5
{
  "security": {
    "sandbox": {
      "enabled": true,
      "mode": "vm",
      "provider": "firecracker",
      "limits": {
        "memory": "1024m",
        "cpu": "2.0"
      }
    }
  }
}
```

#### 进程沙箱

```json5
{
  "security": {
    "sandbox": {
      "enabled": true,
      "mode": "process",
      "limits": {
        "memory": "256m",
        "timeout": 10000
      }
    }
  }
}
```

---

### 会话管理

#### 会话持久化

```json5
{
  "sessions": {
    "enabled": true,
    "storage": "file",          // file, redis, postgres
    "path": "~/.clawdbot/sessions",
    "maxAge": 86400000,         // 24 小时（毫秒）
    "maxSize": 100,             // 最多 100 条消息
    "compression": true
  }
}
```

#### 会话命令

```bash
# 列出会话
clawdbot sessions list

# 查看会话详情
clawdbot sessions info <session-id>

# 导出会话
clawdbot sessions export <session-id> --output session.json

# 清理旧会话
clawdbot sessions cleanup --older-than 7d

# 删除会话
clawdbot sessions delete <session-id>
```

---

### 自动化任务

#### 定时任务

```json5
{
  "automation": {
    "tasks": [
      {
        "name": "Daily Summary",
        "schedule": "0 9 * * *",  // 每天 9:00
        "action": {
          "type": "message",
          "to": "telegram:123456789",
          "text": "Generate daily summary"
        }
      },
      {
        "name": "Backup",
        "schedule": "0 0 * * 0",  // 每周日 0:00
        "action": {
          "type": "command",
          "command": "clawdbot export --output ~/backups/backup-$(date +%Y%m%d).zip"
        }
      }
    ]
  }
}
```

#### Webhook 触发

```json5
{
  "automation": {
    "webhooks": [
      {
        "name": "GitHub Push",
        "path": "/webhooks/github",
        "secret": "${GITHUB_WEBHOOK_SECRET}",
        "action": {
          "type": "message",
          "to": "telegram:123456789",
          "text": "New push to repository: ${payload.repository.name}"
        }
      }
    ]
  }
}
```

---

### 数据导出和备份

#### 导出配置

```bash
# 导出所有配置
clawdbot export --output backup.zip

# 只导出配置文件
clawdbot export --include config --output config.json

# 导出会话
clawdbot export --include sessions --output sessions.zip

# 导出日志
clawdbot export --include logs --output logs.tar.gz
```

#### 自动备份

```json5
{
  "backup": {
    "enabled": true,
    "schedule": "0 2 * * *",    // 每天 2:00
    "destination": "~/backups",
    "retention": 30,             // 保留 30 天
    "include": ["config", "sessions"],
    "compression": true,
    "encryption": {
      "enabled": true,
      "key": "${BACKUP_ENCRYPTION_KEY}"
    }
  }
}
```

---

### 团队协作

#### 多用户配置

```json5
{
  "users": {
    "enabled": true,
    "storage": "postgres",
    "users": [
      {
        "id": "user1",
        "name": "Alice",
        "role": "admin",
        "channels": ["telegram:123456789", "discord:USER_ID_1"],
        "permissions": ["all"]
      },
      {
        "id": "user2",
        "name": "Bob",
        "role": "user",
        "channels": ["telegram:987654321"],
        "permissions": ["read", "write"]
      }
    ]
  }
}
```

#### 权限控制

```json5
{
  "permissions": {
    "roles": {
      "admin": ["all"],
      "user": ["read", "write", "execute"],
      "guest": ["read"]
    },
    "resources": {
      "agents": {
        "create": ["admin"],
        "delete": ["admin"],
        "use": ["admin", "user"]
      },
      "config": {
        "read": ["admin", "user"],
        "write": ["admin"]
      }
    }
  }
}
```

---

### 监控和告警

#### 配置告警

```json5
{
  "monitoring": {
    "enabled": true,
    "alerts": [
      {
        "name": "High Memory Usage",
        "condition": "memory > 80%",
        "action": {
          "type": "message",
          "to": "telegram:123456789",
          "text": "⚠️ High memory usage: ${memory}%"
        }
      },
      {
        "name": "Gateway Down",
        "condition": "gateway.status == 'down'",
        "action": {
          "type": "message",
          "to": "telegram:123456789",
          "text": "🚨 Gateway is down!"
        }
      },
      {
        "name": "High API Cost",
        "condition": "cost.daily > 100",
        "action": {
          "type": "message",
          "to": "telegram:123456789",
          "text": "💰 Daily API cost exceeded $100"
        }
      }
    ]
  }
}
```

#### 集成监控系统

```json5
{
  "monitoring": {
    "exporters": [
      {
        "type": "prometheus",
        "enabled": true,
        "port": 9090,
        "path": "/metrics"
      },
      {
        "type": "grafana",
        "enabled": true,
        "dashboardUrl": "http://localhost:3000"
      }
    ]
  }
}
```

---

### 扩展和插件

#### 安装扩展

```bash
# 从 npm 安装
npm install -g @clawdbot/extension-msteams

# 从本地安装
clawdbot extensions install ./my-extension

# 列出已安装扩展
clawdbot extensions list

# 启用扩展
clawdbot extensions enable msteams

# 禁用扩展
clawdbot extensions disable msteams
```

#### 创建扩展

```javascript
// my-extension/index.js
export default {
  name: "my-extension",
  version: "1.0.0",
  description: "My custom extension",

  async initialize(clawdbot) {
    // 初始化逻辑
    clawdbot.on("message", this.handleMessage);
  },

  async handleMessage(message) {
    // 处理消息
  },

  async shutdown() {
    // 清理逻辑
  }
};
```

---

### MCP (Model Context Protocol) 集成

Clawdbot 支持 MCP 协议，可以连接外部工具和服务。

#### 配置 MCP 服务器

```json5
{
  "mcp": {
    "enabled": true,
    "servers": {
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
      },
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_TOKEN": "${GITHUB_TOKEN}"
        }
      },
      "postgres": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres"],
        "env": {
          "DATABASE_URL": "${DATABASE_URL}"
        }
      }
    }
  }
}
```

#### 使用 MCP 工具

AI 会自动使用可用的 MCP 工具：

```
你: 列出 GitHub 仓库中的所有 issues
AI: [使用 GitHub MCP 服务器获取 issues]

你: 查询数据库中的用户数量
AI: [使用 Postgres MCP 服务器执行查询]
```

---

