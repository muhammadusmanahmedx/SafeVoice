"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RedirectScreen } from "@/components/auth/redirect-screen";
import { useLanguage } from "@/components/providers/language-provider";
import { navigateAfterAuth } from "@/lib/capacitor/navigate-after-auth";
import { ArrowRight, Loader2 } from "lucide-react";

export function LoginForm() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectRole, setRedirectRole] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.redirectTo) {
      const role = result.redirectTo.startsWith("/admin")
        ? "admin"
        : result.redirectTo.startsWith("/counselor")
        ? "counselor"
        : "student";
      setRedirectRole(role);
      // Hard navigation (with a short commit delay in the native WebView)
      // ensures the session cookie is persisted before the next page load.
      navigateAfterAuth(result.redirectTo);
    }
  }

  if (redirectRole) return <RedirectScreen role={redirectRole} />;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">{t("auth.welcomeBack")}</h1>
        <p className="mt-1.5 text-sm text-gray-500">{t("auth.signInSubtitle")}</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-[#193852]">{t("common.email")}</Label>
          <Input
            id="email" name="email" type="email" required
            placeholder="you@school.edu"
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus:border-[#193852] focus:ring-[#193852]"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold text-[#193852]">{t("common.password")}</Label>
          <Input
            id="password" name="password" type="password" required
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus:border-[#193852] focus:ring-[#193852]"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#193852] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#193852]/90 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {t("auth.signingIn")}</>
          ) : (
            <>{t("common.signIn")} <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <div className="mt-8 space-y-3 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
        <p>
          {t("auth.newStudent")}{" "}
          <Link href="/register" className="font-semibold text-[#193852] hover:underline">{t("auth.createAccount")}</Link>
        </p>
        <p>
          {t("auth.counselorQuestion")}{" "}
          <Link href="/counselor-register" className="font-semibold text-[#193852] hover:underline">{t("auth.registerWithCode")}</Link>
        </p>
      </div>
    </div>
  );
}
