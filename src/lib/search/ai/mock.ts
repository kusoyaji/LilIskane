import type { Locale } from "../../../i18n/config.ts";
import { buildDocs } from "../docs.ts";
import { parseQuery } from "../parse.ts";
import { searchDocs } from "../rank.ts";
import type { SearchDoc } from "../types.ts";
import { dh } from "./catalogue.ts";
import { evaluate } from "./criteria.ts";
import type { AiAnswer } from "./types.ts";

/**
 * DEV-ONLY: a canned answer built from the instant engine, so every AI
 * surface (answer card, ticks, AI order, "IA" chips) can be built and tested
 * without a key. The route serves it only outside production, and only to a
 * request carrying `x-search-mock: 1`. It goes through the same validator as
 * a real answer.
 */

const ARABIC = /[؀-ۿ]/;
const docsByLocale: Partial<Record<Locale, SearchDoc[]>> = {};

export function mockAnswer(q: string, locale: Locale): AiAnswer {
  const docs = (docsByLocale[locale] ??= buildDocs(locale));
  const parsed = parseQuery(q);
  const outcome = searchDocs(docs, parsed);
  const language: "fr" | "ar" = ARABIC.test(q) ? "ar" : "fr";
  const top = outcome.hits.slice(0, 5);
  const results = top.map(({ doc }) => {
    const checks = evaluate(doc, parsed);
    return {
      slug: doc.slug,
      fit: outcome.exact && checks.every((c) => c.ok) ? ("exact" as const) : ("close" as const),
      criteria: checks.map((c) => ({ key: c.key, ok: c.ok })),
    };
  });
  const first = top[0]?.doc;
  const exactCount = results.filter((r) => r.fit === "exact").length;
  let summary: string | null = null;
  if (first) {
    const lead = language === "ar" ? first.name.ar : first.name.fr;
    const city = language === "ar" ? first.city.ar : first.city.fr;
    const price = dh(first.price);
    const arCount =
      exactCount === 1 ? "برنامج واحد يستجيب" : exactCount === 2 ? "برنامجان يستجيبان" : `${exactCount} برامج تستجيب`;
    const frCount = exactCount === 1 ? "1 programme répond" : `${exactCount} programmes répondent`;
    summary =
      language === "ar"
        ? exactCount > 0
          ? `${arCount} لبحثكم، أقربها ${lead} في ${city} ابتداءً من ${price} درهم.`
          : `لا يستجيب أي برنامج لكل معاييركم، وأقربها ${lead} في ${city} ابتداءً من ${price} درهم.`
        : exactCount > 0
          ? `${frCount} à votre recherche ; le plus proche est ${lead} à ${city}, à partir de ${price} DH.`
          : `Aucun programme ne réunit tout ; le plus proche est ${lead} à ${city}, à partir de ${price} DH.`;
  }
  return {
    intent: /[?؟]/.test(q) ? "question" : "search",
    language,
    summary,
    clarify: null,
    filters: {
      cities: parsed.cities,
      region: parsed.region,
      bedroomsMin: parsed.bedroomsMin,
      priceMax: parsed.priceMax,
      monthlyMax: parsed.monthlyMax,
      segments: parsed.segments,
      kinds: parsed.kinds,
      statuses: parsed.statuses,
      amenities: parsed.amenities,
    },
    results,
    suggestions:
      language === "ar"
        ? ["تسليم فوري", "شقة بثلاث غرف مع مسبح"]
        : ["Livraison immédiate", "3 chambres avec piscine"],
  };
}
