"use client";

import { useState } from "react";
import Link from "next/link";
import { signUpCounselor } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers/language-provider";
import { navigateAfterAuth } from "@/lib/capacitor/navigate-after-auth";
import { ArrowRight, Loader2 } from "lucide-react";

export function CounselorRegisterForm() {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signUpCounselor(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.redirectTo) {
      navigateAfterAuth(result.redirectTo);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">
          {t("auth.counselorRegister.title")}
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">{t("auth.counselorRegister.subtitle")}</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-sm font-semibold text-[#193852]">
            {t("auth.fullName")}
          </Label>
          <Input
            id="displayName"
            name="displayName"
            required
            placeholder="Dr. Jane Smith"
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-[#193852]">
            {t("auth.counselorRegister.workEmail")}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jane@school.edu"
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold text-[#193852]">
            {t("common.password")}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="counselorCode" className="text-sm font-semibold text-[#193852]">
            {t("auth.counselorRegister.counselorAccessCode")}
          </Label>
          <Input
            id="counselorCode"
            name="counselorCode"
            required
            placeholder="e.g. FAC-DEMO-RV001"
            className="h-10 rounded-xl border-gray-200 bg-gray-50 font-mono text-sm tracking-wider"
          />
          <p className="text-xs text-gray-400">{t("auth.counselorRegister.codeHint")}</p>
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
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t("auth.counselorRegister.registering")}
            </>
          ) : (
            <>
              {t("auth.counselorRegister.registerAsCounselor")} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-semibold text-[#193852] hover:underline">
          {t("auth.counselorRegister.backToSignIn")}
        </Link>
      </p>
    </div>
  );
}
