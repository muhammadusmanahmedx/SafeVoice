"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneOff, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface MeetingCredentials {
  roomName: string;
  jitsiDomain: string;
  userName: string;
  role: "student" | "faculty";
}

interface VideoMeetingRoomProps {
  bookingId: string;
  backHref: string;
}

type CallState = "loading" | "joining" | "joined" | "error";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JitsiApi = any;

function loadJitsiScript(domain: string): Promise<void> {
  const src = `https://${domain}/external_api.js`;
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Jitsi"));
    document.body.appendChild(script);
  });
}

export function VideoMeetingRoom({ bookingId, backHref }: VideoMeetingRoomProps) {
  const router = useRouter();
  const [state, setState] = useState<CallState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [creds, setCreds] = useState<MeetingCredentials | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiRef = useRef<JitsiApi | null>(null);
  const initializedRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const hasExitedRef = useRef(false);
  const mountedRef = useRef(true);

  const exitSession = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;

    if (jitsiRef.current) {
      try {
        jitsiRef.current.dispose();
      } catch {
        // dispose can throw if already torn down
      }
      jitsiRef.current = null;
    }

    // Wipe the iframe so Jitsi's post-call / welcome screen never stays visible
    if (containerRef.current) {
      containerRef.current.replaceChildren();
    }

    router.replace(backHref);
  }, [backHref, router]);

  const fetchCreds = useCallback(async () => {
    setState("loading");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch(`/api/counseling/meeting/${bookingId}`, {
      headers: { "X-User-Timezone": timeZone },
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not load meeting credentials.");
      setState("error");
      return;
    }
    setCreds(json as MeetingCredentials);
    setState("joining");
  }, [bookingId]);

  useEffect(() => {
    fetchCreds();
  }, [fetchCreds]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (jitsiRef.current) {
        try {
          jitsiRef.current.dispose();
        } catch {
          // ignore
        }
        jitsiRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (state !== "joining" || initializedRef.current || !creds || !containerRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        await loadJitsiScript(creds.jitsiDomain);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
        if (!JitsiMeetExternalAPI) throw new Error("Jitsi API unavailable");
        if (!mountedRef.current || !containerRef.current || hasExitedRef.current) return;

        const api = new JitsiMeetExternalAPI(creds.jitsiDomain, {
          roomName: creds.roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName: creds.userName },
          configOverwrite: {
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            enableClosePage: false,
            disableDeepLinking: true,
            startScreenSharing: false,
            disableInviteFunctions: true,
            enableLobbyChat: false,
            disableProfile: true,
            hideConferenceSubject: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ["microphone", "camera", "hangup", "tileview"],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          },
        });

        jitsiRef.current = api;

        const revealTimer = setTimeout(() => {
          if (mountedRef.current && !hasExitedRef.current) setState("joined");
        }, 8000);

        api.addListener("videoConferenceJoined", () => {
          hasJoinedRef.current = true;
          clearTimeout(revealTimer);
          if (mountedRef.current && !hasExitedRef.current) setState("joined");
        });

        api.addListener("videoConferenceLeft", () => {
          if (!hasJoinedRef.current || hasExitedRef.current) return;
          clearTimeout(revealTimer);
          exitSession();
        });

        api.addListener("readyToClose", () => {
          if (!hasJoinedRef.current || hasExitedRef.current) return;
          clearTimeout(revealTimer);
          exitSession();
        });
      } catch (err) {
        console.error(err);
        initializedRef.current = false;
        if (mountedRef.current && !hasExitedRef.current) {
          setError("Failed to start video call. Check camera/mic permissions.");
          setState("error");
        }
      }
    })();
  }, [state, creds, exitSession]);

  if (state === "error") {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{error}</p>
        </div>
        <Button variant="outline" onClick={() => router.replace(backHref)}>
          Back
        </Button>
      </div>
    );
  }

  const showSpinner = state === "loading" || state === "joining";
  const showLeave = state === "joining" || state === "joined";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2">
        <p className="text-sm font-medium text-zinc-100">Counseling Session</p>
        {showLeave && (
          <Button
            size="sm"
            variant="destructive"
            onClick={exitSession}
            className="gap-1.5"
          >
            <PhoneOff className="h-4 w-4" />
            Leave
          </Button>
        )}
      </div>
      <div className="relative flex-1">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        {showSpinner && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950/90">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-zinc-400">Connecting to the session…</p>
          </div>
        )}
      </div>
    </div>
  );
}
