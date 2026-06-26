"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpStudent } from "@/lib/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/components/providers/language-provider";
import { ArrowRight, Loader2 } from "lucide-react";

interface RegisterFormProps {
  institutions: { id: string; name: string; slug: string }[];
}

export function RegisterForm({ institutions }: RegisterFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("institutionId", institutionId);
    const result = await signUpStudent(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result?.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#193852]">{t("auth.createYourAccount")}</h1>
        <p className="mt-1.5 text-sm text-gray-500">{t("auth.registerSubtitle")}</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="displayName" className="text-sm font-semibold text-[#193852]">
            {t("auth.displayNameOptional")}
          </Label>
          <Input
            id="displayName" name="displayName"
            placeholder={t("auth.howYoudLikeToBeCalled")}
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold text-[#193852]">{t("common.email")}</Label>
          <Input
            id="email" name="email" type="email" required
            placeholder="you@school.edu"
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-semibold text-[#193852]">{t("common.password")}</Label>
          <Input
            id="password" name="password" type="password" required minLength={6}
            className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-[#193852]">{t("auth.institution")}</Label>
          <Select value={institutionId} onValueChange={setInstitutionId} required>
            <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-gray-50 text-sm">
              <SelectValue placeholder={t("auth.selectSchool")} />
            </SelectTrigger>
            <SelectContent>
              {institutions.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !institutionId}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#193852] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#193852]/90 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {t("auth.creatingAccount")}</>
          ) : (
            <>{t("auth.createAccountButton")} <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <p className="mt-6 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-semibold text-[#193852] hover:underline">{t("common.signIn")}</Link>
      </p>
    </div>
  );
}
