## 模型配置

Clawdbot 支持多种 AI 模型提供商，可以灵活配置主模型和备用模型。

### 支持的模型提供商

#### 官方提供商

- **Anthropic**: Claude 3.5 Sonnet, Claude Opus 4.5, Claude Haiku
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash
- **OpenRouter**: 100+ 模型聚合平台
- **GitHub Copilot**: 通过 GitHub 订阅使用

#### 中国区提供商

- **MiniMax**: M2.1, abab6.5
- **Moonshot (Kimi)**: moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k
- **GLM (智谱)**: glm-4, glm-4-plus
- **Qwen (通义千问)**: qwen-max, qwen-plus
- **DeepSeek**: deepseek-chat, deepseek-coder

#### 本地/私有化

- **Ollama**: 本地模型运行
- **LM Studio**: 本地 OpenAI 兼容服务
- **vLLM**: 高性能推理引擎
- **LiteLLM**: 统一代理网关

---

### 快速配置

#### 使用 CLI 配置

```bash
# 查看可用模型
clawdbot models list

# 查看当前配置
clawdbot models status

# 设置默认模型
clawdbot models set anthropic/claude-sonnet-4-5

# 添加 API 密钥
clawdbot config set env.vars.ANTHROPIC_API_KEY "sk-ant-..."
clawdbot config set env.vars.OPENAI_API_KEY "sk-..."

# 重启网关使配置生效
clawdbot gateway restart
```

#### 使用配置文件

编辑 `~/.clawdbot/clawdbot.json`：

```json5
{
  "env": {
    "vars": {
      "ANTHROPIC_API_KEY": "sk-ant-...",
      "OPENAI_API_KEY": "sk-...",
      "MINIMAX_API_KEY": "your-minimax-key"
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "anthropic/claude-opus-4-5",
          "openai/gpt-4-turbo"
        ]
      },
      "models": {
        "anthropic/claude-sonnet-4-5": { "alias": "sonnet" },
        "anthropic/claude-opus-4-5": { "alias": "opus" },
        "openai/gpt-4-turbo": { "alias": "gpt4" }
      }
    }
  }
}
```

---

### 配置自定义提供商

#### OpenAI 兼容服务

```json5
{
  "models": {
    "mode": "merge",  // 保留内置提供商
    "providers": {
      "custom-openai": {
        "baseUrl": "https://api.example.com/v1",
        "apiKey": "${CUSTOM_API_KEY}",
        "api": "openai-completions",
        "models": [
          {
            "id": "custom-model",
            "name": "Custom Model",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 128000,
            "maxTokens": 4096
          }
        ]
      }
    }
  }
}
```

#### Anthropic 兼容服务（如 LiteLLM）

```json5
{
  "models": {
    "mode": "merge",
    "providers": {
      "litellm": {
        "baseUrl": "http://localhost:4000/anthropic",
        "apiKey": "${LITELLM_API_KEY}",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "claude-3-5-sonnet-20241022",
            "name": "Claude 3.5 Sonnet (LiteLLM)",
            "reasoning": false,
            "input": ["text", "image"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 200000,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

#### Ollama 本地模型

```bash
# 1. 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. 拉取模型
ollama pull llama3.1:70b
ollama pull qwen2.5:72b

# 3. 启动 Ollama 服务
ollama serve

# 4. 配置 Clawdbot
clawdbot config set env.vars.OLLAMA_API_KEY "ollama"
```

Ollama 会自动被检测，无需手动配置提供商。

#### LM Studio 本地模型

```json5
{
  "models": {
    "mode": "merge",
    "providers": {
      "lmstudio": {
        "baseUrl": "http://127.0.0.1:1234/v1",
        "apiKey": "lmstudio",
        "api": "openai-responses",  // 使用 Responses API
        "models": [
          {
            "id": "minimax-m2.1-gs32",
            "name": "MiniMax M2.1 GS32",
            "reasoning": false,
            "input": ["text"],
            "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
            "contextWindow": 196608,
            "maxTokens": 8192
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "lmstudio/minimax-m2.1-gs32",
        "fallbacks": ["anthropic/claude-sonnet-4-5"]
      }
    }
  }
}
```

---

### 模型别名

为常用模型设置简短别名：

```json5
{
  "agents": {
    "defaults": {
      "models": {
        "anthropic/claude-sonnet-4-5": { "alias": "sonnet" },
        "anthropic/claude-opus-4-5": { "alias": "opus" },
        "anthropic/claude-haiku-4": { "alias": "haiku" },
        "openai/gpt-4-turbo": { "alias": "gpt4" },
        "openai/gpt-3.5-turbo": { "alias": "gpt3" },
        "minimax/abab6.5": { "alias": "minimax" }
      }
    }
  }
}
```

使用别名：

```bash
# 在消息中切换模型
"@sonnet 帮我写一段代码"
"@opus 分析这个问题"
"@minimax 翻译这段文字"
```

---

### 成本追踪

配置模型成本以追踪 API 使用：

```json5
{
  "models": {
    "providers": {
      "anthropic": {
        "models": [
          {
            "id": "claude-sonnet-4-5",
            "cost": {
              "input": 3.0,      // 每百万 token 成本（美元）
              "output": 15.0,
              "cacheRead": 0.3,  // 缓存读取成本
              "cacheWrite": 3.75 // 缓存写入成本
            }
          }
        ]
      }
    }
  }
}
```

查看成本统计：

```bash
clawdbot stats usage --period month
clawdbot stats cost --by-model
```

---

### 模型路由策略

#### 基于场景的路由

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["anthropic/claude-opus-4-5"]
      }
    },
    "profiles": {
      "coding": {
        "model": {
          "primary": "anthropic/claude-opus-4-5"
        }
      },
      "quick": {
        "model": {
          "primary": "anthropic/claude-haiku-4"
        }
      },
      "local": {
        "model": {
          "primary": "lmstudio/minimax-m2.1-gs32",
          "fallbacks": ["anthropic/claude-sonnet-4-5"]
        }
      }
    }
  }
}
```

使用配置文件：

```bash
# 创建代理时指定配置文件
clawdbot agent create --profile coding --workspace ~/projects/myapp

# 或在消息中切换
"@coding 帮我重构这段代码"
```

#### 智能降级

当主模型不可用时，自动使用备用模型：

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "anthropic/claude-opus-4-5",    // 第一备用
          "openai/gpt-4-turbo",           // 第二备用
          "minimax/abab6.5"               // 第三备用
        ]
      },
      "fallbackStrategy": "cascade"  // 级联降级
    }
  }
}
```

---

### 模型认证

#### API Key 认证

```bash
# 方式 1: 环境变量
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."

# 方式 2: 配置文件
clawdbot config set env.vars.ANTHROPIC_API_KEY "sk-ant-..."

# 方式 3: 认证配置文件
clawdbot models auth add
```

#### OAuth 认证（GitHub Copilot）

```bash
# 登录 GitHub
clawdbot models auth login --provider github-copilot

# 验证状态
clawdbot models status
```

#### AWS Bedrock

```bash
# 配置 AWS 凭据
aws configure

# 或使用环境变量
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"

# Clawdbot 会自动检测 AWS 凭据
```

---

### 模型测试

```bash
# 测试模型连接
clawdbot models test anthropic/claude-sonnet-4-5

# 测试所有配置的模型
clawdbot models test --all

# 基准测试
clawdbot models benchmark --models "anthropic/claude-sonnet-4-5,openai/gpt-4-turbo"
```

---

### 常见配置示例

#### 纯 Anthropic

```json5
{
  "env": {
    "vars": {
      "ANTHROPIC_API_KEY": "sk-ant-..."
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["anthropic/claude-opus-4-5", "anthropic/claude-haiku-4"]
      }
    }
  }
}
```

#### 混合云（Anthropic + 中国区）

```json5
{
  "env": {
    "vars": {
      "ANTHROPIC_API_KEY": "sk-ant-...",
      "MINIMAX_API_KEY": "...",
      "MOONSHOT_API_KEY": "..."
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": [
          "minimax/abab6.5",
          "moonshot/moonshot-v1-128k"
        ]
      }
    }
  }
}
```

#### 本地优先

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "lmstudio/minimax-m2.1-gs32",
        "fallbacks": [
          "ollama/llama3.1:70b",
          "anthropic/claude-sonnet-4-5"
        ]
      }
    }
  },
  "models": {
    "mode": "merge"
  }
}
```

---

### 模型配置最佳实践

1. **始终配置备用模型**：避免单点故障
2. **使用 `mode: "merge"`**：保留内置提供商作为后备
3. **设置合理的成本限制**：避免意外高额账单
4. **本地模型需要高性能硬件**：至少 24GB VRAM
5. **定期测试模型连接**：确保 API 密钥有效
6. **使用别名简化切换**：提高使用效率
7. **根据场景选择模型**：编码用 Opus，快速响应用 Haiku

---

