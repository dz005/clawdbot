## 故障排查

本节提供常见问题的解决方案。

### 安装问题

#### 问题：npm install 失败

**症状：**
```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
```

**解决方案：**

```bash
# 方式 1: 使用 sudo（不推荐）
sudo npm install -g clawdbot

# 方式 2: 修改 npm 全局目录（推荐）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g clawdbot

# 方式 3: 使用 pnpm
npm install -g pnpm
pnpm add -g clawdbot
```

#### 问题：Node.js 版本过低

**症状：**
```
Error: Clawdbot requires Node.js >= 22.0.0
```

**解决方案：**

```bash
# 使用 nvm 安装最新 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22

# 验证版本
node --version
```

---

### 网关问题

#### 问题：网关无法启动

**症状：**
```
Error: Address already in use
```

**解决方案：**

```bash
# 检查端口占用
lsof -i :18789
# 或
netstat -an | grep 18789

# 杀死占用进程
kill -9 <PID>

# 或使用不同端口
clawdbot gateway run --port 18790

# 或强制启动
clawdbot gateway run --force
```

#### 问题：网关频繁崩溃

**症状：**
网关运行一段时间后自动停止

**解决方案：**

```bash
# 1. 查看日志找出原因
clawdbot gateway logs --level error

# 2. 检查内存使用
clawdbot gateway status

# 3. 清理旧数据
clawdbot cleanup --sessions --older-than 7

# 4. 减少工作进程
clawdbot config set gateway.workers 2

# 5. 增加超时时间
clawdbot config set gateway.timeout 60000

# 6. 重启网关
clawdbot gateway restart
```

#### 问题：无法连接到远程网关

**症状：**
```
Error: Connection refused
```

**解决方案：**

```bash
# 1. 检查网关是否运行
clawdbot gateway status

# 2. 检查防火墙
sudo ufw status
sudo ufw allow 18789

# 3. 检查绑定地址
clawdbot config get gateway.bind
# 应该是 "lan" 或 "public"，不是 "loopback"

# 4. 测试连接
curl http://your-gateway-ip:18789/health

# 5. 检查认证 token
clawdbot config get gateway.auth.token
```

---

### 渠道问题

#### 问题：WhatsApp 无法登录

**症状：**
二维码不显示或扫码后无响应

**解决方案：**

```bash
# 1. 清理会话数据
rm -rf ~/.clawdbot/sessions/whatsapp

# 2. 重启 WhatsApp 渠道
clawdbot whatsapp restart

# 3. 使用非无头模式（查看浏览器）
clawdbot config set channels.whatsapp.headless false
clawdbot whatsapp login

# 4. 检查浏览器版本
clawdbot browser version

# 5. 更新浏览器驱动
npx playwright install chromium

# 6. 使用共享浏览器模式
clawdbot config set channels.whatsapp.mode "shared"
# 手动在浏览器中登录 WhatsApp Web
```

#### 问题：Telegram Bot 不响应

**症状：**
向 Bot 发送消息没有回复

**解决方案：**

```bash
# 1. 检查 Bot token
clawdbot config get channels.telegram.token

# 2. 验证 token 有效性
curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe

# 3. 检查 Bot 状态
clawdbot telegram status

# 4. 查看日志
clawdbot gateway logs --grep "Telegram"

# 5. 检查 DM 策略
clawdbot config get channels.telegram.dmPolicy
# 如果是 "pairing"，需要先配对
# 如果是 "allowlist"，检查白名单

# 6. 重启渠道
clawdbot gateway restart
```

#### 问题：Discord Bot 离线

**症状：**
Bot 显示离线状态

**解决方案：**

```bash
# 1. 检查 token
clawdbot config get channels.discord.token

# 2. 验证 token（应该以 Bot 开头）
# 如果 token 不以 "Bot " 开头，添加前缀
clawdbot config set channels.discord.token "Bot YOUR_TOKEN"

# 3. 检查 intents
clawdbot config get channels.discord.intents
# 确保包含必要的 intents

# 4. 检查 Bot 权限
# 在 Discord Developer Portal 中确认 Bot 有足够权限

# 5. 重启网关
clawdbot gateway restart
```

#### 问题：Signal 发送失败

**症状：**
```
Error: signal-cli not found
```

**解决方案：**

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

# 4. 配置路径
clawdbot config set channels.signal.signalCliPath "$(which signal-cli)"

# 5. 重启网关
clawdbot gateway restart
```

---

### 模型问题

#### 问题：API 密钥无效

**症状：**
```
Error: Invalid API key
```

**解决方案：**

```bash
# 1. 检查 API 密钥
clawdbot config get env.vars.ANTHROPIC_API_KEY

# 2. 验证密钥格式
# Anthropic: sk-ant-api03-...
# OpenAI: sk-...
# MiniMax: eyJ...

# 3. 重新设置密钥
clawdbot config set env.vars.ANTHROPIC_API_KEY "sk-ant-..."

# 4. 测试连接
clawdbot models test anthropic/claude-sonnet-4-5

# 5. 重启网关
clawdbot gateway restart
```

#### 问题：模型请求超时

**症状：**
```
Error: Request timeout
```

**解决方案：**

```bash
# 1. 增加超时时间
clawdbot config set gateway.timeout 60000

# 2. 检查网络连接
curl -I https://api.anthropic.com

# 3. 使用代理（如果需要）
export HTTPS_PROXY=http://proxy.example.com:8080
clawdbot gateway restart

# 4. 切换到备用模型
clawdbot config set agents.defaults.model.fallbacks '["anthropic/claude-opus-4-5"]'

# 5. 检查 API 状态
# 访问提供商状态页面
```

#### 问题：本地模型无法连接

**症状：**
```
Error: Connection refused to localhost:11434
```

**解决方案：**

```bash
# Ollama
# 1. 检查 Ollama 是否运行
ollama list

# 2. 启动 Ollama
ollama serve

# 3. 测试连接
curl http://localhost:11434/api/tags

# LM Studio
# 1. 打开 LM Studio
# 2. 加载模型
# 3. 启动本地服务器（默认端口 1234）
# 4. 测试连接
curl http://localhost:1234/v1/models

# 5. 更新配置
clawdbot config set models.providers.lmstudio.baseUrl "http://localhost:1234/v1"
clawdbot gateway restart
```

---

### 性能问题

#### 问题：响应速度慢

**症状：**
AI 响应时间过长

**解决方案：**

```bash
# 1. 使用更快的模型
clawdbot models set anthropic/claude-haiku-4

# 2. 减少上下文长度
clawdbot config set agents.defaults.maxContextMessages 20

# 3. 启用缓存
clawdbot config set agents.defaults.caching true

# 4. 使用本地模型
# 配置 Ollama 或 LM Studio

# 5. 优化网络
# 使用 CDN 或更近的 API 端点

# 6. 检查系统资源
clawdbot gateway status
top
```

#### 问题：内存占用过高

**症状：**
网关内存使用超过 1GB

**解决方案：**

```bash
# 1. 清理旧会话
clawdbot cleanup --sessions --older-than 7

# 2. 限制会话大小
clawdbot config set sessions.maxSize 50
clawdbot config set sessions.maxAge 43200000  # 12 小时

# 3. 启用压缩
clawdbot config set sessions.compression true

# 4. 减少工作进程
clawdbot config set gateway.workers 2

# 5. 重启网关
clawdbot gateway restart

# 6. 监控内存
watch -n 5 'clawdbot gateway status | grep Memory'
```

---

### 数据问题

#### 问题：配置文件损坏

**症状：**
```
Error: Invalid JSON in config file
```

**解决方案：**

```bash
# 1. 验证配置
clawdbot config validate

# 2. 备份当前配置
cp ~/.clawdbot/clawdbot.json ~/.clawdbot/clawdbot.json.backup

# 3. 尝试自动修复
clawdbot config validate --fix

# 4. 手动编辑
clawdbot config edit

# 5. 如果无法修复，恢复默认配置
mv ~/.clawdbot/clawdbot.json ~/.clawdbot/clawdbot.json.broken
clawdbot onboard
```

#### 问题：会话数据丢失

**症状：**
历史对话消失

**解决方案：**

```bash
# 1. 检查会话文件
ls -lh ~/.clawdbot/sessions/

# 2. 检查会话配置
clawdbot config get sessions

# 3. 恢复备份（如果有）
cp ~/backups/sessions.zip ~/.clawdbot/
cd ~/.clawdbot
unzip sessions.zip

# 4. 启用自动备份
clawdbot config set backup.enabled true
clawdbot config set backup.schedule "0 2 * * *"

# 5. 重启网关
clawdbot gateway restart
```

---

### 权限问题

#### 问题：文件权限错误

**症状：**
```
Error: EACCES: permission denied
```

**解决方案：**

```bash
# 1. 检查文件所有权
ls -la ~/.clawdbot/

# 2. 修复权限
chmod -R 755 ~/.clawdbot/
chown -R $USER:$USER ~/.clawdbot/

# 3. 检查工作空间权限
chmod -R 755 ~/clawd/

# 4. macOS: 授予完全磁盘访问权限
# System Settings > Privacy & Security > Full Disk Access
# 添加 Terminal 或 Clawdbot.app
```

#### 问题：无法访问浏览器

**症状：**
```
Error: Failed to launch browser
```

**解决方案：**

```bash
# 1. 安装浏览器驱动
npx playwright install chromium

# 2. macOS: 授予自动化权限
# System Settings > Privacy & Security > Automation
# 允许 Terminal 控制浏览器

# 3. 检查浏览器路径
clawdbot config get browser.executablePath

# 4. 使用系统浏览器
clawdbot config set browser.executablePath "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 5. 重启网关
clawdbot gateway restart
```

---

### 诊断工具

#### 运行完整诊断

```bash
# 基础诊断
clawdbot doctor

# 详细诊断
clawdbot doctor --verbose

# 自动修复
clawdbot doctor --fix
```

#### 收集诊断信息

```bash
# 生成诊断报告
clawdbot diagnose --output diagnose.txt

# 报告包含：
# - 系统信息
# - 配置信息
# - 网关状态
# - 渠道状态
# - 模型状态
# - 最近日志
# - 错误信息
```

#### 启用调试模式

```bash
# 启用详细日志
clawdbot config set gateway.logging.level "debug"
clawdbot gateway restart

# 查看调试日志
clawdbot gateway logs --follow --level debug

# 恢复正常日志级别
clawdbot config set gateway.logging.level "info"
clawdbot gateway restart
```

---

### 获取帮助

如果以上方法都无法解决问题：

1. **查看文档**
   - 在线文档: https://docs.clawd.bot
   - 本地文档: `clawdbot help`

2. **搜索已知问题**
   - GitHub Issues: https://github.com/clawdbot/clawdbot/issues
   - 搜索关键词找到类似问题

3. **提交问题报告**
   ```bash
   # 生成诊断报告
   clawdbot diagnose --output diagnose.txt

   # 在 GitHub 创建 Issue，附上：
   # - 问题描述
   # - 复现步骤
   # - 诊断报告
   # - 相关日志
   ```

4. **社区支持**
   - GitHub Discussions
   - Discord 社区
   - Stack Overflow (标签: clawdbot)

---

