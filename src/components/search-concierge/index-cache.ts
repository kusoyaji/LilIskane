import type { SearchDoc } from "@/lib/search";
import type { Locale } from "@/i18n/config";

/**
 * The search index, fetched once per locale on the first sign of intent
 * (pointer over or focus on a trigger, or the keyboard shortcut) and kept in
 * module scope for the rest of the visit. ~18 KB of static JSON; no page pays
 * for it until someone reaches for search.
 */
const cache = new Map<Locale, Promise<SearchDoc[]>>();

export function loadIndex(locale: Locale): Promise<SearchDoc[]> {
  let pending = cache.get(locale);
  if (!pending) {
    pending = fetch(`/api/search/${locale}`)
      .then((response) => {
        if (!response.ok) throw new Error(`search index ${response.status}`);
        return response.json() as Promise<SearchDoc[]>;
      })
      .catch((error: unknown) => {
        // A failed fetch must not poison the cache: the next intent retries.
        cache.delete(locale);
        throw error;
      });
    cache.set(locale, pending);
  }
  return pending;
}

/** Fire-and-forget warm-up; failures surface when the overlay actually asks. */
export function prefetchIndex(locale: Locale): void {
  loadIndex(locale).catch(() => {});
}
