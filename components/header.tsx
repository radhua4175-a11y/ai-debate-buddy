"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApiResource } from "@/lib/client/use-api-resource";
import { useUser } from "@/lib/client/use-user";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { format, localeNames, locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { ThemeToggle } from "./theme-toggle";
import { totalStars } from "@/lib/ratings";
import type { DebateSummary } from "@/lib/types";

export function Header() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const name = user?.name ?? "";
  // Only fetched when signed in; re-fetched on navigation so the star count is fresh after each debate.
  const { data } = useApiResource<{ debates: DebateSummary[] }>(user ? "/api/debates" : null, pathname);

  async function logOut() {
    try {
      await getBrowserSupabase().auth.signOut();
    } finally {
      router.replace(`/${locale}/login`);
      router.refresh();
    }
  }
  const stars = data ? totalStars(data.debates) : null;

  const switchHref = (target: Locale) => {
    const rest = pathname.split("/").slice(2).join("/");
    return `/${target}${rest ? `/${rest}` : ""}`;
  };

  return (
    <header className="border-b-2 border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-xl font-extrabold">
          <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-primary text-xl">
            💬
          </span>
          {dict.meta.title}
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-base font-bold">
          {user && (
            <Link
              href={`/${locale}/progress`}
              className="flex items-center gap-2 rounded-full bg-help-soft px-4 py-2 text-help"
              title={dict.header.myProgress}
            >
              <span>{name ? format(dict.header.hi, { name }) : dict.header.hiAnon}</span>
              {stars !== null && <span>★ {format(dict.common.stars, { count: stars })}</span>}
            </Link>
          )}
          <div role="group" aria-label={dict.common.language} className="flex gap-1 text-sm">
            {locales.map((target) => (
              <Link
                key={target}
                href={switchHref(target)}
                lang={target}
                hrefLang={target}
                aria-current={target === locale ? "true" : undefined}
                className={`rounded-lg px-2.5 py-1.5 ${target === locale ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"}`}
              >
                {localeNames[target]}
              </Link>
            ))}
          </div>
          <ThemeToggle />
          {user && (
            <button
              type="button"
              onClick={() => void logOut()}
              className="rounded-xl border-2 border-border px-3 py-1.5 text-sm hover:border-primary"
            >
              {dict.auth.logout}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
