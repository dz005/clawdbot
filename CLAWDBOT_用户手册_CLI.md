## CLI 命令参考

Clawdbot 提供了丰富的 CLI 命令来管理网关、代理、消息和配置。

### 全局选项

```bash
clawdbot [command] [options]

全局选项：
  --version, -v          显示版本号
  --help, -h             显示帮助信息
  --config <path>        指定配置文件路径
  --verbose              详细输出
  --quiet                静默模式
  --no-color             禁用颜色输出
```

---

### 网关管理

#### gateway run

前台运行网关（用于调试）：

```bash
clawdbot gateway run [options]

选项：
  --bind <mode>          绑定模式: loopback, lan, tailscale, public
  --port <number>        端口号（默认: 18789）
  --force                强制启动（即使已有实例运行）
  --no-browser           不自动打开浏览器
  --log-level <level>    日志级别: debug, info, warn, error

示例：
  clawdbot gateway run --bind loopback --port 18789
  clawdbot gateway run --bind tailscale --log-level debug
```

#### gateway start

后台启动网关：

```bash
clawdbot gateway start [options]

选项：
  --bind <mode>          绑定模式
  --port <number>        端口号
  --daemon               以守护进程模式运行

示例：
  clawdbot gateway start
  clawdbot gateway start --bind lan --port 8080
```

#### gateway stop

停止网关：

```bash
clawdbot gateway stop [options]

选项：
  --force                强制停止
  --timeout <seconds>    超时时间（默认: 30）

示例：
  clawdbot gateway stop
  clawdbot gateway stop --force
```

#### gateway restart

重启网关：

```bash
clawdbot gateway restart [options]

示例：
  clawdbot gateway restart
  clawdbot gateway restart --bind tailscale
```

#### gateway status

查看网关状态：

```bash
clawdbot gateway status [options]

选项：
  --json                 JSON 格式输出
  --watch                持续监控模式

示例：
  clawdbot gateway status
  clawdbot gateway status --json
  clawdbot gateway status --watch
```

#### gateway logs

查看网关日志：

```bash
clawdbot gateway logs [options]

选项：
  --follow, -f           实时跟踪日志
  --lines <number>       显示最后 N 行（默认: 100）
  --level <level>        过滤日志级别
  --grep <pattern>       搜索模式

示例：
  clawdbot gateway logs
  clawdbot gateway logs --follow
  clawdbot gateway logs --lines 500 --level error
  clawdbot gateway logs --grep "WhatsApp"
```

---

### 代理管理

#### agent create

创建新代理：

```bash
clawdbot agent create [options]

选项：
  --workspace <path>     工作空间路径
  --model <id>           主模型 ID
  --profile <name>       使用配置文件
  --name <name>          代理名称
  --description <text>   代理描述

示例：
  clawdbot agent create --workspace ~/projects/myapp
  clawdbot agent create --profile coding --model anthropic/claude-opus-4-5
  clawdbot agent create --name "Code Assistant" --workspace ~/code
```

#### agent list

列出所有代理：

```bash
clawdbot agent list [options]

选项：
  --json                 JSON 格式输出
  --active               只显示活跃代理
  --workspace <path>     按工作空间过滤

示例：
  clawdbot agent list
  clawdbot agent list --active
  clawdbot agent list --json
```

#### agent info

查看代理详情：

```bash
clawdbot agent info <agent-id> [options]

选项：
  --json                 JSON 格式输出
  --sessions             显示会话信息
  --stats                显示统计信息

示例：
  clawdbot agent info abc123
  clawdbot agent info abc123 --sessions
  clawdbot agent info abc123 --stats --json
```

#### agent delete

删除代理：

```bash
clawdbot agent delete <agent-id> [options]

选项：
  --force                跳过确认
  --keep-workspace       保留工作空间文件

示例：
  clawdbot agent delete abc123
  clawdbot agent delete abc123 --force
  clawdbot agent delete abc123 --keep-workspace
```

#### agent switch

切换当前代理：

```bash
clawdbot agent switch <agent-id>

示例：
  clawdbot agent switch abc123
```

---

### 消息管理

#### message send

发送消息：

```bash
clawdbot message send [options]

选项：
  --to <recipient>       接收者（格式: channel:id）
  --text <message>       文本消息
  --file <path>          发送文件
  --image <path>         发送图片
  --caption <text>       图片/文件说明
  --model <id>           使用特定模型
  --agent <id>           使用特定代理
  --thinking <mode>      思考模式: off, low, medium, high
  --stream               流式输出

示例：
  clawdbot message send --to "telegram:123456789" --text "Hello"
  clawdbot message send --to "whatsapp:+1234567890" --image ./photo.jpg --caption "Check this"
  clawdbot message send --to "discord:USER_ID" --file ./report.pdf
  clawdbot message send --to "telegram:123456789" --text "Explain this code" --model anthropic/claude-opus-4-5
```

#### message history

查看消息历史：

```bash
clawdbot message history [options]

选项：
  --channel <name>       按渠道过滤
  --user <id>            按用户过滤
  --agent <id>           按代理过滤
  --limit <number>       限制数量（默认: 50）
  --since <date>         起始日期
  --format <type>        输出格式: text, json, csv

示例：
  clawdbot message history
  clawdbot message history --channel telegram --limit 100
  clawdbot message history --user "123456789" --since "2024-01-01"
  clawdbot message history --format json > messages.json
```

---

### 配置管理

#### config get

获取配置值：

```bash
clawdbot config get [key] [options]

选项：
  --json                 JSON 格式输出
  --all                  显示所有配置

示例：
  clawdbot config get                           # 显示所有配置
  clawdbot config get gateway.port              # 获取特定值
  clawdbot config get agents.defaults.model     # 获取嵌套值
  clawdbot config get --json                    # JSON 输出
```

#### config set

设置配置值：

```bash
clawdbot config set <key> <value> [options]

选项：
  --type <type>          值类型: string, number, boolean, json

示例���
  clawdbot config set gateway.port 18789
  clawdbot config set channels.telegram.token "YOUR_TOKEN"
  clawdbot config set agents.defaults.model.primary "anthropic/claude-sonnet-4-5"
  clawdbot config set channels.telegram.allowlist '[123, 456]' --type json
```

#### config unset

删除配置项：

```bash
clawdbot config unset <key>

示例：
  clawdbot config unset channels.telegram.token
  clawdbot config unset agents.defaults.model.fallbacks[0]
```

#### config edit

在编辑器中编辑配置：

```bash
clawdbot config edit [options]

选项：
  --editor <name>        指定编辑器（默认: $EDITOR）

示例：
  clawdbot config edit
  clawdbot config edit --editor vim
```

#### config validate

验证配置文件：

```bash
clawdbot config validate [options]

选项：
  --fix                  自动修复问题
  --strict               严格模式

示例：
  clawdbot config validate
  clawdbot config validate --fix
```

---

### 模型管理

#### models list

列出可用模型：

```bash
clawdbot models list [options]

选项：
  --provider <name>      按提供商过滤
  --json                 JSON 格式输出
  --available            只显示可用模型（有 API key）

示例：
  clawdbot models list
  clawdbot models list --provider anthropic
  clawdbot models list --available
```

#### models status

查看模型状态：

```bash
clawdbot models status [options]

选项：
  --json                 JSON 格式输出
  --test                 测试连接

示例：
  clawdbot models status
  clawdbot models status --test
```

#### models set

设置默认模型：

```bash
clawdbot models set <model-id> [options]

选项：
  --agent <id>           为特定代理设置
  --profile <name>       为配置文件设置

示例：
  clawdbot models set anthropic/claude-sonnet-4-5
  clawdbot models set openai/gpt-4-turbo --agent abc123
```

#### models test

测试模型连接：

```bash
clawdbot models test [model-id] [options]

选项：
  --all                  测试所有模型
  --timeout <seconds>    超时时间（默认: 30）

示例：
  clawdbot models test anthropic/claude-sonnet-4-5
  clawdbot models test --all
```

#### models auth

管理模型认证：

```bash
# 添加认证
clawdbot models auth add [options]

# 列出认证
clawdbot models auth list

# 删除认证
clawdbot models auth remove <provider>

# OAuth 登录
clawdbot models auth login --provider <name>

示例：
  clawdbot models auth add
  clawdbot models auth list
  clawdbot models auth login --provider github-copilot
  clawdbot models auth remove anthropic
```

---

### 渠道管理

#### channels status

查看渠道状态：

```bash
clawdbot channels status [options]

选项：
  --all                  显示所有渠道（包括未配置）
  --deep                 深度探测（测试连接）
  --json                 JSON 格式输出

示例：
  clawdbot channels status
  clawdbot channels status --all
  clawdbot channels status --deep
```

#### 特定渠道命令

每个渠道都有专用命令：

```bash
# WhatsApp
clawdbot whatsapp status
clawdbot whatsapp login
clawdbot whatsapp logout
clawdbot whatsapp restart

# Telegram
clawdbot telegram status
clawdbot telegram info
clawdbot telegram webhook set <url>
clawdbot telegram webhook delete

# Discord
clawdbot discord status
clawdbot discord invite

# Slack
clawdbot slack status
clawdbot slack test

# Signal
clawdbot signal status
clawdbot signal register <number>
clawdbot signal verify <code>
```

---

### 诊断和维护

#### doctor

运行系统诊断：

```bash
clawdbot doctor [options]

选项：
  --fix                  自动修复问题
  --verbose              详细输出

示例：
  clawdbot doctor
  clawdbot doctor --fix
```

#### stats

查看统计信息：

```bash
clawdbot stats [type] [options]

类型：
  usage                  使用统计
  cost                   成本统计
  performance            性能统计

选项：
  --period <range>       时间范围: day, week, month, year
  --by-model             按模型分组
  --by-channel           按渠道分组
  --json                 JSON 格式输出

示例：
  clawdbot stats usage --period month
  clawdbot stats cost --by-model
  clawdbot stats performance --json
```

#### logs

查看应用日志：

```bash
clawdbot logs [options]

选项：
  --follow, -f           实时跟踪
  --lines <number>       显示行数
  --level <level>        日志级别
  --component <name>     按组件过滤

示例：
  clawdbot logs --follow
  clawdbot logs --lines 1000 --level error
  clawdbot logs --component whatsapp
```

#### cleanup

清理数据：

```bash
clawdbot cleanup [options]

选项：
  --sessions             清理旧会话
  --logs                 清理日志文件
  --cache                清理缓存
  --older-than <days>    清理 N 天前的数据
  --dry-run              预览但不执行

示例：
  clawdbot cleanup --sessions --older-than 30
  clawdbot cleanup --logs --cache
  clawdbot cleanup --dry-run
```

---

### 初始化和配置向导

#### onboard

运行初始化向导：

```bash
clawdbot onboard [options]

选项：
  --mode <type>          模式: quickstart, advanced
  --skip-channels        跳过渠道配置
  --skip-models          跳过模型配置

示例：
  clawdbot onboard
  clawdbot onboard --mode advanced
  clawdbot onboard --skip-channels
```

#### configure

交互式配置向导：

```bash
clawdbot configure [section] [options]

部分：
  gateway                网关配置
  models                 模型配置
  channels               渠道配置
  security               安全配置

示例：
  clawdbot configure
  clawdbot configure gateway
  clawdbot configure models
```

---

### 实用工具

#### version

显示版本信息：

```bash
clawdbot version [options]

选项：
  --json                 JSON 格式输出
  --check-update         检查更新

示例：
  clawdbot version
  clawdbot version --check-update
```

#### update

更新 Clawdbot：

```bash
clawdbot update [options]

选项：
  --channel <name>       更新渠道: stable, beta, dev
  --force                强制更新

示例：
  clawdbot update
  clawdbot update --channel beta
```

#### export

导出配置和数据：

```bash
clawdbot export [options]

选项：
  --output <path>        输出文件路径
  --include <items>      包含项: config, sessions, logs
  --format <type>        格式: json, yaml, zip

示例：
  clawdbot export --output backup.zip
  clawdbot export --include config,sessions --format json
```

#### import

导入配置和数据：

```bash
clawdbot import <file> [options]

选项：
  --merge                合并而非替换
  --dry-run              预览但不执行

示例：
  clawdbot import backup.zip
  clawdbot import config.json --merge
```

---

### 命令别名

常用命令的简短别名：

```bash
clawdbot gw run        # gateway run
clawdbot gw start      # gateway start
clawdbot gw stop       # gateway stop
clawdbot gw status     # gateway status

clawdbot msg send      # message send
clawdbot msg history   # message history

clawdbot cfg get       # config get
clawdbot cfg set       # config set
```

---

