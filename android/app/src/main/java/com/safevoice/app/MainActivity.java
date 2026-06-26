package com.safevoice.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    // Bundled fallback page (copied from public/ during `cap sync`). It probes
    // connectivity and either redirects to the remote app or shows an offline
    // screen with a retry button.
    private static final String OFFLINE_PAGE = "file:///android_asset/public/index.html";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure the WebView accepts and persists cookies so the Supabase
        // auth session survives navigations and app restarts.
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);

        final WebView webView = this.bridge != null ? this.bridge.getWebView() : null;
        if (webView != null) {
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            // Wrap Capacitor's own client so normal URL handling is preserved,
            // while adding self-healing for the two things that leave the app
            // stuck on a blank/blue screen:
            //   1. The remote site fails to load (no internet / unreachable).
            //   2. The render process is killed while the app is backgrounded,
            //      so on reopen the WebView is dead and never recovers.
            webView.setWebViewClient(new BridgeWebViewClient(this.bridge) {
                @Override
                public void onReceivedError(
                    WebView view,
                    WebResourceRequest request,
                    WebResourceError error
                ) {
                    if (request != null && request.isForMainFrame()) {
                        // Don't let the system error page strand the user. Show
                        // our resilient offline/loading shell instead.
                        view.loadUrl(OFFLINE_PAGE);
                        return;
                    }
                    super.onReceivedError(view, request, error);
                }

                @Override
                public boolean onRenderProcessGone(
                    WebView view,
                    RenderProcessGoneDetail detail
                ) {
                    // The renderer was destroyed (commonly when Android reclaims
                    // memory from a backgrounded app). Recreate the activity to
                    // obtain a fresh WebView and reload, instead of returning to
                    // a dead, blank view. Returning true prevents an app crash.
                    try {
                        recreate();
                    } catch (Exception ignored) {
                        // If recreate fails for any reason, swallow it; returning
                        // true still avoids the default crash behaviour.
                    }
                    return true;
                }
            });
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Flush cookies to disk immediately so a freshly-set login cookie is
        // never lost if the process is killed.
        CookieManager.getInstance().flush();
    }

    @Override
    public void onStop() {
        super.onStop();
        CookieManager.getInstance().flush();
    }
}
