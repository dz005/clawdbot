#!/usr/bin/env node
import { monitorDingTalkProvider } from "./../../dist/dingtalk/monitor.js";
import { loadConfig } from "./../../dist/config/config.js";

console.log("Testing DingTalk Stream connection...");

const cfg = await loadConfig();
console.log("Config loaded");
console.log("DingTalk config:", JSON.stringify(cfg.channels?.dingtalk, null, 2));

const abortController = new AbortController();

// Stop after 30 seconds
setTimeout(() => {
  console.log("Stopping test...");
  abortController.abort();
  process.exit(0);
}, 30000);

try {
  await monitorDingTalkProvider({
    config: cfg,
    abortSignal: abortController.signal,
    onMessage: (message) => {
      console.log("Received message:", message);
    },
  });
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
}
