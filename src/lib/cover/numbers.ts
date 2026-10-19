const digitMap: Record<string, string> = {
  '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
  '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'
};
export function westernize(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (digit) => digitMap[digit]).replace(/٫/g, '.').replace(/[٬،]/g, '');
}
export function parseLocalizedNumber(input: string): number | null {
  const normalized = westernize(input).trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
export function formatMm(value: number, locale = 'ar'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}
export const mmToPt = (mm: number): number => mm * 72 / 25.4;
export const ptToMm = (pt: number): number => pt * 25.4 / 72;
