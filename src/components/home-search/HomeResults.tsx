import type { ReactNode } from "react";
import { ProjectCard } from "@/components/search/ProjectCard";
import { toListItems } from "@/data/list";
import { projects } from "@/data/projects";
import type { Locale } from "@/i18n/config";
import { ResultsClient } from "./ResultsClient";

/**
 * Résultats — the answer, as the /projets cards.
 *
 * Every card is rendered here, on the server, once: the media manifest and the
 * card markup never reach the browser as code. The client part only decides
 * which of these 23 elements show, and in what order, from the live search —
 * React moves the existing nodes, so a picture already loaded stays loaded and
 * nothing is laid out twice.
 */
export function HomeResults({ locale }: { locale: Locale }) {
  const items = toListItems(projects, locale);
  const cards: Record<string, ReactNode> = {};
  items.forEach((item) => {
    cards[item.slug] = (
      <ProjectCard
        locale={locale}
        item={item}
        sizes="(min-width: 64rem) 28rem, (min-width: 40rem) 45vw, 92vw"
      />
    );
  });
  return <ResultsClient locale={locale} cards={cards} />;
}
