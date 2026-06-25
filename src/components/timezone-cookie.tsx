"use client";

import { useEffect } from "react";

const COOKIE_NAME = "user-timezone";

export function TimezoneCookie() {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(timeZone)};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  return null;
}
