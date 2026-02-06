# 钉钉私聊机器人快速开始

## 前置条件

1. 一个钉钉企业账号
2. 已安装 clawdbot

## 步骤 1: 创建钉钉机器人

1. 访问 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部应用或第三方应用
3. 启用机器人能力
4. 在应用设置中启用 **Stream 模式**
5. 订阅 **机器人消息** 事件 (`TOPIC_ROBOT`)

## 步骤 2: 获取凭证

从应用详情页面获取：

- **Client ID** (AppKey)
- **Client Secret** (AppSecret)
- **Robot Code** (机器人代码)

## 步骤 3: 配置 Clawdbot

编辑 `~/.clawdbot/config.json`：

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

或使用环境变量：

```bash
export DINGTALK_CLIENT_ID="your-client-id"
export DINGTALK_CLIENT_SECRET="your-client-secret"
export DINGTALK_ROBOT_CODE="your-robot-code"
```

## 步骤 4: 启动网关

```bash
clawdbot gateway run
```

你应该看到类似的日志：

```
[dingtalk] Starting DingTalk Stream client for account "default"...
[dingtalk] DingTalk Stream client connected successfully
```

## 步骤 5: 测试

1. 在钉钉中找到你的机器人
2. 添加机器人为联系人
3. 发送消息给机器人
4. 机器人应该会回复

## 检查状态

```bash
clawdbot channels status
```

## 故障排查

### 连接失败

- 检查凭证是否正确
- 确认 Stream 模式已启用
- 检查网络连接

### 收不到消息

- 确认已订阅 `TOPIC_ROBOT` 事件
- 检查用户是否已添加机器人为联系人
- 查看日志：`tail -f ~/.clawdbot/logs/gateway.log`

## 下一步

- 配置 AI 模型
- 自定义机器人行为
- 添加更多渠道

## 需要帮助？

查看完整文档：`extensions/dingtalk/README.md`
