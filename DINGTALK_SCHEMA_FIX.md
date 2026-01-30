# 钉钉渠道配置 Schema 修复

## 问题

UI 上 DingTalk 渠道显示 "Channel config schema unavailable."

## 原因

钉钉渠道的配置 schema 没有正确导出到 plugin-sdk，导致 UI 无法获取配置结构。

## 解决方案

### 1. 添加 Zod Schema 定义

在 `src/config/zod-schema.providers-core.ts` 中添加了钉钉的 Zod schema：

```typescript
export const DingTalkAccountSchema = z
  .object({
    enabled: z.boolean().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    robotCode: z.string().optional(),
  })
  .strict();

export const DingTalkConfigSchema = z
  .object({
    defaultAccount: z.string().optional(),
    accounts: z.record(z.string(), DingTalkAccountSchema.optional()).optional(),
    // Legacy top-level config (for backward compatibility)
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    robotCode: z.string().optional(),
  })
  .strict();
```

### 2. 导出到 Plugin SDK

在 `src/plugin-sdk/index.ts` 中添加导出：

```typescript
export {
  DiscordConfigSchema,
  DingTalkConfigSchema,  // 新增
  GoogleChatConfigSchema,
  // ...
} from "../config/zod-schema.providers-core.js";
```

### 3. 更新插件使用

在 `extensions/dingtalk/src/channel.ts` 中使用导出的 schema：

```typescript
import {
  buildChannelConfigSchema,
  DingTalkConfigSchema,  // 使用导出的 schema
  // ...
} from "clawdbot/plugin-sdk";

export const dingtalkPlugin: ChannelPlugin<DingTalkAccountConfig> = {
  id: "dingtalk",
  configSchema: buildChannelConfigSchema(DingTalkConfigSchema),
  // ...
};
```

## 配置字段说明

### 顶层配置（向后兼容）

```json
{
  "channels": {
    "dingtalk": {
      "clientId": "string (optional)",
      "clientSecret": "string (optional)",
      "robotCode": "string (optional)"
    }
  }
}
```

### 多账户配置

```json
{
  "channels": {
    "dingtalk": {
      "defaultAccount": "string (optional)",
      "accounts": {
        "account-id": {
          "enabled": "boolean (optional)",
          "clientId": "string (optional)",
          "clientSecret": "string (optional)",
          "robotCode": "string (optional)"
        }
      }
    }
  }
}
```

## 验证

1. ✅ TypeScript 编译通过
2. ✅ Schema 正确导出
3. ✅ UI 应该能正确显示配置表单

## 测试

重启 clawdbot gateway 后，在 UI 中访问 DingTalk 渠道配置页面，应该能看到：

- Client ID 输入框
- Client Secret 输入框（敏感字段）
- Robot Code 输入框
- 账户启用/禁用开关

## 相关文件

- `src/config/zod-schema.providers-core.ts` - Schema 定义
- `src/plugin-sdk/index.ts` - Schema 导出
- `extensions/dingtalk/src/channel.ts` - 插件使用
