/**
 * Fold a string for matching: lower case, no Latin accents, no Arabic
 * diacritics or tatweel, one form of alef / yaa / taa marbuta, digits in
 * Western form, punctuation as spaces. "Témara", "temara" and "TEMARA" are
 * one word; so are "مُسلَّم" and "مسلم".
 */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Latin combining accents
    .replace(/[ً-ٰٟـ]/g, "") // Arabic harakat, superscript alef, tatweel
    .replace(/[آأإٱ]/g, "ا") // آ أ إ ٱ → ا
    .replace(/ى/g, "ي") // ى → ي
    .replace(/ة/g, "ه") // ة → ه
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // ٠-٩ → 0-9
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)) // ۰-۹ → 0-9
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function words(value: string): string[] {
  const folded = normalize(value);
  return folded ? folded.split(" ") : [];
}
