import type { Language } from "@/lib/i18n/messages";

/**
 * Money is whole rupiah everywhere — the database stores Int, and nothing
 * rounds on the way through. Rupiah has no subunit in practice, so cents
 * would be a decimal point waiting to drift.
 */
export function formatIDR(amount: number, language: Language = "ID"): string {
  const n = new Intl.NumberFormat(language === "ID" ? "id-ID" : "en-GB", { maximumFractionDigits: 0 }).format(Math.abs(amount));
  return `${amount < 0 ? "−" : ""}Rp${n}`;
}

/** What the tutor types — "150.000", "150000", "Rp 150rb" is not accepted — as whole rupiah. */
export function parseIDR(value: string): number | null {
  const cleaned = value.replace(/[Rr][Pp]/g, "").replace(/[.\s,]/g, "").trim();
  if (!/^-?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isSafeInteger(n) ? n : null;
}
