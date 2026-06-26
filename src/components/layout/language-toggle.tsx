"use client";

import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/providers/language-provider";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  align?: "start" | "center" | "end";
}

export function LanguageToggle({ className, align = "end" }: LanguageToggleProps) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 rounded-lg", className)}
          aria-label={t("language.toggle")}
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {LOCALES.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onClick={() => setLocale(item.code)}
            className="flex items-center justify-between gap-4"
          >
            <span>{item.nativeLabel}</span>
            {locale === item.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
