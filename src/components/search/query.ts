import { DEFAULT_DEPOSIT } from "@/lib/credit";

/**
 * Query-string editing for the search controls, in the browser.
 *
 * The keys are the public URL contract defined by `src/lib/filter.ts`
 * (`ville`, `prix`, `mensualite`, `apport`, `standing`, `type`, `chambres`,
 * `statut`, `equipements`). `ville` is one city id or a comma list: the city
 * select and a map pin set one, a region typed into the search sets several.
 * That module is not imported here because it imports the full portfolio,
 * which must never reach a client bundle; the server parses the URL with it,
 * and this file only edits the string.
 */
export type ListKey = "ville" | "standing" | "type" | "statut" | "equipements";
export type ScalarKey = "mensualite" | "apport" | "ville" | "chambres" | "prix";

/** The deposit left out of the URL (lib/credit.ts has no imports, so it is safe in the browser). */
export { DEFAULT_DEPOSIT };

/** Lists stay legible in a shared link: "statut=immediate,imminente", not %2C. */
const legible = (params: URLSearchParams) => params.toString().replace(/%2C/gi, ",");

export function withScalar(query: string, key: ScalarKey, value: string | number | null): string {
  const params = new URLSearchParams(query);
  if (value === null || value === "" || (key === "apport" && Number(value) === DEFAULT_DEPOSIT)) {
    params.delete(key);
  } else {
    params.set(key, String(value));
  }
  return legible(params);
}

export function toggleInList(query: string, key: ListKey, value: string): string {
  const params = new URLSearchParams(query);
  const current = (params.get(key) ?? "").split(",").filter(Boolean);
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  if (next.length) params.set(key, next.join(","));
  else params.delete(key);
  return legible(params);
}

export function listOf(query: string, key: ListKey): string[] {
  return (new URLSearchParams(query).get(key) ?? "").split(",").filter(Boolean);
}

export function scalarOf(query: string, key: ScalarKey): string | null {
  return new URLSearchParams(query).get(key);
}
