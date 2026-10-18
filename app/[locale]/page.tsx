import { notFound } from "next/navigation";
import { HomeScreen } from "@/components/home-screen";
import { isLocale } from "@/lib/i18n/config";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomeScreen />;
}
