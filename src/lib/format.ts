import { format, parseISO, isValid } from "date-fns";

/**
 * Format an integer or numeric value in Bangladeshi Taka currency.
 * Always renders with tabular numbers and the '৳ ' prefix: e.g. "৳ 12,500"
 */
export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "৳ 0";
  }

  const numericValue = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(numericValue)) {
    return "৳ 0";
  }

  // Format as integer in taka according to Bangladeshi numbering locale (e.g. 1,00,000 / 10,000)
  const formatted = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.abs(numericValue));

  if (numericValue < 0) {
    return `-৳ ${formatted}`;
  }

  return `৳ ${formatted}`;
}

/**
 * Format a date string or Date object safely with fallback.
 * Default format: "dd MMM yyyy" (e.g. "21 Nov 2026")
 */
export function formatDate(
  date: string | Date | null | undefined,
  pattern: string = "dd MMM yyyy"
): string {
  if (!date) return "—";

  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) {
      // Fallback if ISO parse failed (e.g. standard Date constructor string)
      const fallbackDate = new Date(date);
      if (isValid(fallbackDate)) {
        return format(fallbackDate, pattern);
      }
      return "—";
    }
    return format(d, pattern);
  } catch {
    return "—";
  }
}

/**
 * Format an ISO date or timestamp into a short month label: e.g. "Nov 2026" or "Nov '26"
 */
export function formatMonthYear(date: string | Date | null | undefined): string {
  return formatDate(date, "MMM yyyy");
}
