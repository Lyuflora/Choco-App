import type { AppSettings } from "../types/models";

export function formatCurrency(value: number, settings: AppSettings): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: settings.currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMetric(value: number, suffix: string): string {
  return `${Number(value.toFixed(2))} ${suffix}`;
}

