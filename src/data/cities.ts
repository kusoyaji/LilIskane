import type { City } from "./types";

/**
 * The 15 cities Chaabi builds in. Coordinates are real, because the map on
 * /projets is a geographic filter rather than a decorative graphic — a project
 * plotted in the wrong place is a lie about where someone would live.
 */
export const cities: City[] = [
  { id: "al-hoceima", name: { fr: "Al Hoceima", ar: "الحسيمة" }, lat: 35.2517, lng: -3.9372 },
  { id: "agadir", name: { fr: "Agadir", ar: "أكادير" }, lat: 30.4278, lng: -9.5981 },
  { id: "casablanca", name: { fr: "Casablanca", ar: "الدار البيضاء" }, lat: 33.5731, lng: -7.5898 },
  { id: "essaouira", name: { fr: "Essaouira", ar: "الصويرة" }, lat: 31.5085, lng: -9.7595 },
  { id: "had-soualem", name: { fr: "Had Soualem", ar: "حد السوالم" }, lat: 33.4167, lng: -7.85 },
  { id: "kenitra", name: { fr: "Kénitra", ar: "القنيطرة" }, lat: 34.261, lng: -6.5802 },
  { id: "ksar-el-kebir", name: { fr: "Ksar El Kébir", ar: "القصر الكبير" }, lat: 35.0011, lng: -5.9006 },
  { id: "marrakech", name: { fr: "Marrakech", ar: "مراكش" }, lat: 31.6295, lng: -7.9811 },
  { id: "mohammedia", name: { fr: "Mohammedia", ar: "المحمدية" }, lat: 33.6866, lng: -7.383 },
  { id: "nador", name: { fr: "Nador", ar: "الناظور" }, lat: 35.1681, lng: -2.9335 },
  { id: "nouaceur", name: { fr: "Nouaceur", ar: "النواصر" }, lat: 33.3667, lng: -7.5833 },
  { id: "rabat", name: { fr: "Rabat", ar: "الرباط" }, lat: 34.0209, lng: -6.8416 },
  { id: "sala-al-jadida", name: { fr: "Sala Al Jadida", ar: "سلا الجديدة" }, lat: 34.0, lng: -6.75 },
  { id: "sidi-rahal", name: { fr: "Sidi Rahal", ar: "سيدي رحال" }, lat: 33.4667, lng: -7.4333 },
  { id: "tanger", name: { fr: "Tanger", ar: "طنجة" }, lat: 35.7595, lng: -5.834 },
  { id: "temara", name: { fr: "Témara", ar: "تمارة" }, lat: 33.9287, lng: -6.9067 },
];

export const cityById = new Map(cities.map((c) => [c.id, c]));

export function getCity(id: string): City {
  const city = cityById.get(id);
  if (!city) throw new Error(`Unknown city: ${id}`);
  return city;
}
