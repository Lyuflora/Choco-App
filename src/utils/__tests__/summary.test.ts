import { describe, expect, it } from "vitest";
import { buildCalendarCells, calculateMonthSummary, summarizeDate } from "../summary";
import type { Chocolate, Entry } from "../../types/models";

const chocolates: Chocolate[] = [
  {
    id: "c1",
    brand: "Lindt",
    productName: "70%",
    category: "Dark Bar",
    cacaoPercent: 70,
    originCountry: "Switzerland",
    flavorNotes: [],
    ingredients: [],
    packageSizeGrams: 100,
    defaultCalories: 180,
    defaultPrice: 4,
    rating: 4,
    favorite: false,
    buyAgain: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
];

const entries: Entry[] = [
  {
    id: "e1",
    date: "2026-03-03",
    actionType: "eat",
    chocolateId: "c1",
    bars: 1,
    grams: 40,
    calories: 210,
    spend: null,
    note: "",
    createdAt: "2026-03-03T10:00:00.000Z",
    updatedAt: "2026-03-03T10:00:00.000Z",
  },
  {
    id: "e2",
    date: "2026-03-03",
    actionType: "purchase",
    chocolateId: "c1",
    bars: null,
    grams: null,
    calories: null,
    spend: 6.5,
    note: "",
    createdAt: "2026-03-03T11:00:00.000Z",
    updatedAt: "2026-03-03T11:00:00.000Z",
  },
  {
    id: "e3",
    date: "2026-03-04",
    actionType: "no_chocolate",
    chocolateId: null,
    bars: null,
    grams: null,
    calories: null,
    spend: null,
    note: "",
    createdAt: "2026-03-04T11:00:00.000Z",
    updatedAt: "2026-03-04T11:00:00.000Z",
  },
];

describe("summarizeDate", () => {
  it("aggregates totals for a specific day", () => {
    const summary = summarizeDate(entries, "2026-03-03");
    expect(summary.totalBars).toBe(1);
    expect(summary.totalGrams).toBe(40);
    expect(summary.totalCalories).toBe(210);
    expect(summary.totalSpend).toBe(6.5);
    expect(summary.hasChocolate).toBe(true);
  });
});

describe("buildCalendarCells", () => {
  it("marks entry days and no-chocolate days in the month grid", () => {
    const cells = buildCalendarCells(entries, new Date("2026-03-10T00:00:00.000Z"));
    expect(cells.find((cell) => cell.date === "2026-03-03")?.hasEntry).toBe(true);
    expect(cells.find((cell) => cell.date === "2026-03-04")?.isNoChocolateOnly).toBe(true);
  });
});

describe("calculateMonthSummary", () => {
  it("returns spend, calories, and most frequent brand", () => {
    const summary = calculateMonthSummary(entries, chocolates, new Date("2026-03-10T00:00:00.000Z"));
    expect(summary.chocolateDays).toBe(1);
    expect(summary.totalCalories).toBe(210);
    expect(summary.totalSpend).toBe(6.5);
    expect(summary.mostFrequentBrand).toBe("Lindt");
  });
});

