import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicSuggester } from "@/components/topic-suggester";
import { btnPrimary, card } from "@/components/styles";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { sampleTopics } from "@/lib/topics";

export async function generateMetadata({ params }: PageProps<"/[locale]/topics">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { topics } = await getDictionary(locale);
  return { title: topics.title, description: topics.subtitle };
}

export default async function TopicsPage({ params }: PageProps<"/[locale]/topics">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { topics } = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold">{topics.title}</h1>
        <p className="text-lg text-muted">{topics.subtitle}</p>
      </header>

      <ul className="space-y-4">
        {sampleTopics.map((topic) => {
          const sample = topic.sample[locale];
          return (
            <li key={topic.id} className={`${card} space-y-3`}>
              <p className="text-sm font-semibold text-muted">{topics.categories[topic.category]}</p>
              <h2 className="text-xl font-bold text-balance">
                <span aria-hidden>{topic.emoji} </span>
                {topic.question[locale]}
              </h2>
              <details className="group">
                <summary className="cursor-pointer text-lg font-bold text-primary">
                  <span className="group-open:hidden">{topics.show}</span>
                  <span className="hidden group-open:inline">{topics.hide}</span>
                </summary>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {(["agree", "disagree"] as const).map((side) => (
                    <div key={side} className={`rounded-2xl p-4 ${side === "agree" ? "bg-good-soft" : "bg-next-soft"}`}>
                      <p className="text-lg font-extrabold">
                        {side === "agree" ? "👍" : "👎"} {side === "agree" ? topics.agreeSide : topics.disagreeSide}
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {sample[side].map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
              <Link href={`/${locale}/setup?topic=${topic.id}`} className={btnPrimary}>
                {topics.practiceThis}
              </Link>
            </li>
          );
        })}
      </ul>

      <TopicSuggester />
    </div>
  );
}
