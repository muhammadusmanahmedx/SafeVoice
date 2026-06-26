import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const defaultUrl = "https://safe-voices.vercel.app";

function loadServerUrl() {
  if (!existsSync(envPath)) return defaultUrl;
  const env = readFileSync(envPath, "utf8");
  const match = env.match(/^CAPACITOR_SERVER_URL=(.+)$/m);
  if (!match) return defaultUrl;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

const serverUrl = loadServerUrl();

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>SafeVoice</title>
    <style>
      body {
        margin: 0;
        font-family: system-ui, sans-serif;
        background: #193852;
        color: #fff;
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
      }
    </style>
    <script>
      (function () {
        var REMOTE = ${JSON.stringify(serverUrl)};
        var host = window.location.hostname;
        if (host === "localhost" || host === "127.0.0.1") {
          window.location.replace(REMOTE);
        }
      })();
    </script>
  </head>
  <body>
    <p>Loading SafeVoice…</p>
  </body>
</html>
`;

writeFileSync(join(root, "public/index.html"), html, "utf8");
console.log(`Wrote public/index.html → redirects localhost to ${serverUrl}`);
