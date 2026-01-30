import type { ClawdbotPluginRuntime } from "clawdbot/plugin-sdk";

let runtime: ClawdbotPluginRuntime | null = null;

export function setDingTalkRuntime(rt: ClawdbotPluginRuntime): void {
  runtime = rt;
}

export function getDingTalkRuntime(): ClawdbotPluginRuntime {
  if (!runtime) {
    throw new Error("DingTalk runtime not initialized");
  }
  return runtime;
}
