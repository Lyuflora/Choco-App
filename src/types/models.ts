// Shared app models live here so storage, screens, and helpers all speak the same shapes.
export type ActionType = "eat" | "taste" | "purchase" | "no_chocolate";

export type PreferredUnit = "grams" | "bars";

export type CurrencyCode = "USD" | "EUR" | "GBP";

export interface Chocolate {
  id: string;
  brand: string;
  productName: string;
  category: string;
  cacaoPercent: number | null;
  originCountry: string;
  flavorNotes: string[];
  ingredients: string[];
  packageSizeGrams: number | null;
  defaultCalories: number | null;
  defaultPrice: number | null;
  rating: number | null;
  favorite: boolean;
  buyAgain: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  date: string;
  actionType: ActionType;
  chocolateId: string | null;
  bars: number | null;
  grams: number | null;
  calories: number | null;
  spend: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  monthlyBudget: number;
  dailyCalorieGoal: number;
  preferredUnit: PreferredUnit;
  currency: CurrencyCode;
}

export interface DarkDiaryStore {
  chocolates: Chocolate[];
  entries: Entry[];
  settings: AppSettings;
}

export interface EntryDraft {
  actionType: ActionType;
  chocolateId: string | null;
  bars: number | null;
  grams: number | null;
  calories: number | null;
  spend: number | null;
  note: string;
}

export interface ChocolateDraft {
  brand: string;
  productName: string;
  category: string;
  cacaoPercent: number | null;
  originCountry: string;
  flavorNotesText: string;
  ingredientsText: string;
  packageSizeGrams: number | null;
  defaultCalories: number | null;
  defaultPrice: number | null;
  rating: number | null;
  favorite: boolean;
  buyAgain: boolean;
}

export interface CalendarCell {
  date: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  hasEntry: boolean;
  isNoChocolateOnly: boolean;
  entryCount: number;
}

export interface DateSummary {
  date: string;
  entries: Entry[];
  totalBars: number;
  totalGrams: number;
  totalCalories: number;
  totalSpend: number;
  hasChocolate: boolean;
  isNoChocolateOnly: boolean;
}

export interface MonthSummary {
  chocolateDays: number;
  totalBars: number;
  totalGrams: number;
  totalCalories: number;
  totalSpend: number;
  noChocolateStreak: number;
  mostFrequentBrand: string;
  averageSpendPerChocolateDay: number;
}
