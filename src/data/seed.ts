// Seed data gives the app a believable starting state so the UI is testable before a real user logs anything.
import { addDays, nowIso, toDateKey } from "../utils/date";
import type { AppSettings, Chocolate, DarkDiaryStore, Entry } from "../types/models";

function dateOffset(daysFromToday: number): string {
  return toDateKey(addDays(new Date(), daysFromToday));
}

function makeChocolate(input: Omit<Chocolate, "createdAt" | "updatedAt">): Chocolate {
  const timestamp = nowIso();
  return {
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function makeEntry(input: Omit<Entry, "createdAt" | "updatedAt">): Entry {
  const timestamp = nowIso();
  return {
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const defaultSettings: AppSettings = {
  monthlyBudget: 120,
  dailyCalorieGoal: 250,
  preferredUnit: "grams",
  currency: "USD",
};

export const seedChocolates: Chocolate[] = [
  makeChocolate({
    id: "choc-lindt-70",
    brand: "Lindt",
    productName: "Excellence 70% Cocoa",
    category: "Dark Bar",
    cacaoPercent: 70,
    originCountry: "Switzerland",
    flavorNotes: ["roasted cacao", "coffee", "dry finish"],
    ingredients: ["cocoa mass", "sugar", "cocoa butter", "vanilla"],
    packageSizeGrams: 100,
    defaultCalories: 170,
    defaultPrice: 4.99,
    rating: 4.2,
    favorite: true,
    buyAgain: true,
  }),
  makeChocolate({
    id: "choc-ritual-maya",
    brand: "Ritual",
    productName: "Mid Mountain Blend",
    category: "Craft Dark",
    cacaoPercent: 70,
    originCountry: "United States",
    flavorNotes: ["toffee", "red fruit", "warm spice"],
    ingredients: ["cacao beans", "organic cane sugar"],
    packageSizeGrams: 70,
    defaultCalories: 160,
    defaultPrice: 8.5,
    rating: 4.8,
    favorite: true,
    buyAgain: true,
  }),
  makeChocolate({
    id: "choc-felchlin",
    brand: "Felchlin",
    productName: "Madagascar Sambirano 68%",
    category: "Single Origin",
    cacaoPercent: 68,
    originCountry: "Madagascar",
    flavorNotes: ["citrus", "berry", "silky body"],
    ingredients: ["cocoa beans", "sugar", "cocoa butter"],
    packageSizeGrams: 50,
    defaultCalories: 145,
    defaultPrice: 7.25,
    rating: 4.6,
    favorite: false,
    buyAgain: true,
  }),
];

export const seedEntries: Entry[] = [
  makeEntry({
    id: "entry-1",
    date: dateOffset(-5),
    actionType: "purchase",
    chocolateId: "choc-ritual-maya",
    bars: null,
    grams: null,
    calories: null,
    spend: 8.5,
    note: "Bought from the specialty shelf downtown.",
  }),
  makeEntry({
    id: "entry-2",
    date: dateOffset(-4),
    actionType: "taste",
    chocolateId: "choc-ritual-maya",
    bars: 0.25,
    grams: 15,
    calories: 75,
    spend: null,
    note: "Bright red fruit and a clean finish.",
  }),
  makeEntry({
    id: "entry-3",
    date: dateOffset(-3),
    actionType: "no_chocolate",
    chocolateId: null,
    bars: null,
    grams: null,
    calories: null,
    spend: null,
    note: "Intentional reset day.",
  }),
  makeEntry({
    id: "entry-4",
    date: dateOffset(-2),
    actionType: "eat",
    chocolateId: "choc-lindt-70",
    bars: 0.5,
    grams: 25,
    calories: 145,
    spend: null,
    note: "A quick afternoon square during work.",
  }),
  makeEntry({
    id: "entry-5",
    date: dateOffset(-1),
    actionType: "eat",
    chocolateId: "choc-felchlin",
    bars: 0.5,
    grams: 20,
    calories: 110,
    spend: null,
    note: "More berry than expected.",
  }),
];

export function createSeedStore(): DarkDiaryStore {
  return {
    chocolates: seedChocolates,
    entries: seedEntries,
    settings: defaultSettings,
  };
}
