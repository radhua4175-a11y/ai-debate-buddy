import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SetupForm } from "@/components/setup-form";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[locale]/setup">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: (await getDictionary(locale)).setup.title, robots: { index: false } };
}

export default async function SetupPage({ params }: PageProps<"/[locale]/setup">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <Suspense fallback={null}>
      <SetupForm />
    </Suspense>
  );
}
