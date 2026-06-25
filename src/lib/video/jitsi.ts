import { randomBytes } from "crypto";

// Public Jitsi instance that (a) allows being embedded in an iframe and
// (b) permits ANONYMOUS guest joins — no login and no "waiting for a moderator".
//   - meet.jit.si  → embeddable BUT now forces moderator login (don't use)
//   - meet.ffmuc.net → anonymous BUT blocks iframe embedding ("refused to connect")
//   - jitsi.riot.im (Element) → embeddable AND anonymous → our default
// Override with JITSI_DOMAIN if needed.
const DEFAULT_DOMAIN = "jitsi.riot.im";

/** Unique, hard-to-guess room name — only shared with booked participants via our API. */
export function createMeetingRoomName(bookingId: string): string {
  const shortId = bookingId.replace(/-/g, "").slice(0, 12);
  const secret = randomBytes(12).toString("hex");
  return `SafeVoice-${shortId}-${secret}`;
}

export function getJitsiDomain(): string {
  return process.env.JITSI_DOMAIN?.trim() || DEFAULT_DOMAIN;
}

export function getJitsiMeetingUrl(
  roomName: string,
  userName: string,
  options?: { startAudioMuted?: boolean; startVideoMuted?: boolean }
): string {
  const domain = getJitsiDomain();
  const hash = new URLSearchParams();
  hash.set("config.prejoinPageEnabled", "false");
  hash.set("config.startScreenSharing", "false");
  hash.set("config.disableInviteFunctions", "true");
  hash.set("config.enableClosePage", "false");
  hash.set(
    "interfaceConfig.TOOLBAR_BUTTONS",
    '["microphone","camera","hangup","tileview"]'
  );
  hash.set("userInfo.displayName", userName);
  if (options?.startAudioMuted) hash.set("config.startWithAudioMuted", "true");
  if (options?.startVideoMuted) hash.set("config.startWithVideoMuted", "true");

  return `https://${domain}/${encodeURIComponent(roomName)}#${hash.toString()}`;
}
