import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgressView } from "@/components/progress-view";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[locale]/progress">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: (await getDictionary(locale)).progress.title, robots: { index: false } };
}

export default async function ProgressPage({ params }: PageProps<"/[locale]/progress">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ProgressView />;
}
