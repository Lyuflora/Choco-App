// Summary helpers turn raw entries into daily and monthly rollups so screens can stay mostly presentational.
import { calendarBounds, eachDay, isSameMonth, monthBounds, parseDateKey, todayDateKey, toDateKey } from "./date";
import type { CalendarCell, Chocolate, DateSummary, Entry, MonthSummary } from "../types/models";

export function getEntriesForDate(entries: Entry[], date: string): Entry[] {
  return entries
    .filter((entry) => entry.date === date)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function summarizeDate(entries: Entry[], date: string): DateSummary {
  const dayEntries = getEntriesForDate(entries, date);
  const hasChocolate = dayEntries.some((entry) => entry.actionType !== "no_chocolate");
  const isNoChocolateOnly = dayEntries.length > 0 && dayEntries.every((entry) => entry.actionType === "no_chocolate");

  return {
    date,
    entries: dayEntries,
    totalBars: sumValues(dayEntries, "bars"),
    totalGrams: sumValues(dayEntries, "grams"),
    totalCalories: sumValues(dayEntries, "calories"),
    totalSpend: sumValues(dayEntries, "spend"),
    hasChocolate,
    isNoChocolateOnly,
  };
}

export function buildCalendarCells(entries: Entry[], anchor: Date): CalendarCell[] {
  const bounds = calendarBounds(anchor);

  return eachDay(bounds.start, bounds.end).map((date) => {
    const dateKey = toDateKey(date);
    const summary = summarizeDate(entries, dateKey);

    return {
      date: dateKey,
      dayNumber: date.getDate(),
      inCurrentMonth: isSameMonth(date, anchor),
      hasEntry: summary.entries.length > 0,
      isNoChocolateOnly: summary.isNoChocolateOnly,
      entryCount: summary.entries.length,
    };
  });
}

export function calculateMonthSummary(entries: Entry[], chocolates: Chocolate[], anchor: Date): MonthSummary {
  const { start, end } = monthBounds(anchor);
  const monthEntries = entries.filter((entry) => {
    const date = parseDateKey(entry.date);
    return date >= start && date <= end;
  });

  const chocolateDayDates = uniqueDates(
    monthEntries.filter((entry) => entry.actionType !== "no_chocolate").map((entry) => entry.date),
  );

  return {
    chocolateDays: chocolateDayDates.length,
    totalBars: sumValues(monthEntries, "bars"),
    totalGrams: sumValues(monthEntries, "grams"),
    totalCalories: sumValues(monthEntries, "calories"),
    totalSpend: sumValues(monthEntries, "spend"),
    noChocolateStreak: calculateNoChocolateStreak(entries, anchor),
    mostFrequentBrand: mostFrequentBrand(monthEntries, chocolates),
    averageSpendPerChocolateDay:
      chocolateDayDates.length === 0 ? 0 : sumValues(monthEntries, "spend") / chocolateDayDates.length,
  };
}

export function calculateNoChocolateStreak(entries: Entry[], anchor: Date): number {
  const { start, end } = monthBounds(anchor);
  const limitDate = isSameMonth(anchor, new Date()) ? parseDateKey(todayDateKey()) : end;

  let streak = 0;
  for (let cursor = limitDate; cursor >= start; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1)) {
    const summary = summarizeDate(entries, toDateKey(cursor));
    if (!summary.isNoChocolateOnly) {
      break;
    }
    streak += 1;
  }

  return streak;
}

export function entriesForMonth(entries: Entry[], anchor: Date): Entry[] {
  const { start, end } = monthBounds(anchor);
  return entries.filter((entry) => {
    const date = parseDateKey(entry.date);
    return date >= start && date <= end;
  });
}

export function chocolateNameById(chocolates: Chocolate[], chocolateId: string | null): string {
  if (!chocolateId) {
    return "No chocolate selected";
  }

  const match = chocolates.find((chocolate) => chocolate.id === chocolateId);
  return match ? `${match.brand} ${match.productName}` : "Unknown chocolate";
}

function mostFrequentBrand(entries: Entry[], chocolates: Chocolate[]): string {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    if (!entry.chocolateId) {
      continue;
    }
    const chocolate = chocolates.find((item) => item.id === entry.chocolateId);
    const brand = chocolate?.brand ?? "Unknown";
    counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }

  let winner = "None yet";
  let highest = 0;

  for (const [brand, count] of counts.entries()) {
    if (count > highest) {
      winner = brand;
      highest = count;
    }
  }

  return winner;
}

function uniqueDates(dates: string[]): string[] {
  return [...new Set(dates)];
}

function sumValues(entries: Entry[], key: "bars" | "grams" | "calories" | "spend"): number {
  const value = entries.reduce((sum, entry) => sum + (entry[key] ?? 0), 0);
  return Number(value.toFixed(2));
}
