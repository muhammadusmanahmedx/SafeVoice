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

// This page is the native WebView shell. With `server.url` set, Capacitor
// normally loads the remote site directly. This file is shown only as a
// fallback: when the app first boots, when the remote fails to load (no
// internet / server unreachable), or when MainActivity recovers from a
// killed render process. It must therefore be self-healing:
//   - probe connectivity (avoids navigation-error loops)
//   - redirect to the remote app once reachable
//   - show a friendly offline screen + retry when it is not
//   - auto-reconnect the moment connectivity returns
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="color-scheme" content="dark" />
    <title>SafeVoice</title>
    <style>
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      html, body { height: 100%; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        background: #193852;
        color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 32px calc(24px + env(safe-area-inset-right)) calc(32px + env(safe-area-inset-bottom)) calc(24px + env(safe-area-inset-left));
      }
      .logo {
        width: 76px;
        height: 76px;
        border-radius: 20px;
        margin-bottom: 22px;
        object-fit: contain;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.22);
        border-top-color: #fff;
        animation: spin 0.9s linear infinite;
        margin-bottom: 20px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      h1 { font-size: 19px; margin: 0 0 10px; font-weight: 700; }
      p {
        font-size: 14px;
        margin: 0;
        color: rgba(255, 255, 255, 0.78);
        max-width: 300px;
        line-height: 1.55;
      }
      button {
        margin-top: 26px;
        background: #fff;
        color: #193852;
        border: 0;
        border-radius: 999px;
        padding: 13px 32px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.15s ease;
      }
      button:active { opacity: 0.8; }
      .hidden { display: none !important; }
    </style>
  </head>
  <body>
    <img class="logo" src="./logo.png" alt="SafeVoice" onerror="this.style.display='none'" />

    <div id="loading">
      <div class="spinner"></div>
      <h1>Loading SafeVoice…</h1>
      <p>Just a moment while we connect you.</p>
    </div>

    <div id="offline" class="hidden">
      <h1>You're offline</h1>
      <p>SafeVoice needs an internet connection. Please reconnect and try again.</p>
      <button id="retry" type="button">Try again</button>
    </div>

    <script>
      (function () {
        var REMOTE = ${JSON.stringify(serverUrl)};
        var loading = document.getElementById("loading");
        var offline = document.getElementById("offline");
        var retry = document.getElementById("retry");
        var checking = false;

        function showOffline() {
          checking = false;
          loading.classList.add("hidden");
          offline.classList.remove("hidden");
        }
        function showLoading() {
          offline.classList.add("hidden");
          loading.classList.remove("hidden");
        }
        function go() {
          window.location.replace(REMOTE);
        }

        function check() {
          if (checking) return;
          checking = true;
          showLoading();

          // Fast path: the device reports it is offline.
          if (navigator && navigator.onLine === false) {
            showOffline();
            return;
          }

          var done = false;
          var timer = setTimeout(function () {
            if (done) return;
            done = true;
            showOffline();
          }, 8000);

          // Probe the remote with an opaque request so we only navigate once
          // it is actually reachable. This prevents a navigate -> error ->
          // reload -> navigate loop when the network is down.
          try {
            fetch(REMOTE, { mode: "no-cors", cache: "no-store" })
              .then(function () {
                if (done) return;
                done = true;
                clearTimeout(timer);
                go();
              })
              .catch(function () {
                if (done) return;
                done = true;
                clearTimeout(timer);
                showOffline();
              });
          } catch (e) {
            // fetch unavailable: fall back to the online flag.
            clearTimeout(timer);
            if (navigator && navigator.onLine === false) {
              showOffline();
            } else {
              go();
            }
          }
        }

        retry.addEventListener("click", check);
        window.addEventListener("online", check);

        check();
      })();
    </script>
  </body>
</html>
`;

writeFileSync(join(root, "public/index.html"), html, "utf8");
console.log(`Wrote public/index.html → resilient shell for ${serverUrl}`);
