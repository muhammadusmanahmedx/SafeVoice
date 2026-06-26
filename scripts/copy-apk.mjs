import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "android/app/build/outputs/apk/debug/app-debug.apk");
const destDir = join(root, "public/downloads");
const dest = join(destDir, "safevoice.apk");

if (!existsSync(source)) {
  console.error(
    "APK not found. Build it first:\n" +
      "  npx cap sync android && cd android && ./gradlew assembleDebug"
  );
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(source, dest);
console.log(`Copied APK to ${dest}`);
