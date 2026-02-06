import fs from "node:fs";
import { sendImageDingTalk } from "./../../dist/dingtalk/send.js";
import { loadConfig } from "./../../dist/config/config.js";

async function main() {
  try {
    console.log("Loading config...");
    const config = loadConfig();

    console.log("Reading image file...");
    const imageBuffer = fs.readFileSync("/Users/dengzhi/clawd/test.jpg");
    console.log(`Image size: ${imageBuffer.length} bytes`);

    console.log("Sending image to 邓志 (staffId: 02511417361171876)...");
    await sendImageDingTalk({
      userId: "02511417361171876",
      imageBuffer,
      fileName: "test.jpg",
      accountId: "default",
      config,
    });

    console.log("✅ Image sent successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

main();
