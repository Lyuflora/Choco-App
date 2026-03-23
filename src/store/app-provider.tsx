import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createSeedStore, defaultSettings } from "../data/seed";
import { loadStore, saveStore } from "../storage/local-store";
import type {
  AppSettings,
  Chocolate,
  ChocolateDraft,
  DarkDiaryStore,
  DateSummary,
  Entry,
  EntryDraft,
  MonthSummary,
} from "../types/models";
import { nowIso } from "../utils/date";
import { chocolateNameById, calculateMonthSummary, summarizeDate } from "../utils/summary";
import { parseListText, validateChocolateDraft, validateEntryDraft } from "../utils/validation";

interface DarkDiaryContextValue {
  store: DarkDiaryStore;
  isHydrating: boolean;
  saveEntry: (date: string, draft: EntryDraft) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  saveChocolate: (draft: ChocolateDraft, chocolateId?: string) => Promise<string>;
  deleteChocolate: (chocolateId: string) => Promise<void>;
  toggleFavorite: (chocolateId: string) => Promise<void>;
  toggleBuyAgain: (chocolateId: string) => Promise<void>;
  updateSettings: (nextSettings: AppSettings) => Promise<void>;
  getChocolate: (chocolateId?: string | null) => Chocolate | undefined;
  getDateSummary: (date: string) => DateSummary;
  getMonthSummary: (anchor: Date) => MonthSummary;
  resetWithSeedData: () => Promise<void>;
}

const DarkDiaryContext = createContext<DarkDiaryContextValue | null>(null);

export function createEmptyEntryDraft(): EntryDraft {
  return {
    actionType: "eat",
    chocolateId: null,
    bars: null,
    grams: null,
    calories: null,
    spend: null,
    note: "",
  };
}

export function createEmptyChocolateDraft(): ChocolateDraft {
  return {
    brand: "",
    productName: "",
    category: "Dark Bar",
    cacaoPercent: null,
    originCountry: "",
    flavorNotesText: "",
    ingredientsText: "",
    packageSizeGrams: null,
    defaultCalories: null,
    defaultPrice: null,
    rating: null,
    favorite: false,
    buyAgain: false,
  };
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function toChocolateDraft(chocolate?: Chocolate): ChocolateDraft {
  if (!chocolate) {
    return createEmptyChocolateDraft();
  }

  return {
    brand: chocolate.brand,
    productName: chocolate.productName,
    category: chocolate.category,
    cacaoPercent: chocolate.cacaoPercent,
    originCountry: chocolate.originCountry,
    flavorNotesText: chocolate.flavorNotes.join(", "),
    ingredientsText: chocolate.ingredients.join(", "),
    packageSizeGrams: chocolate.packageSizeGrams,
    defaultCalories: chocolate.defaultCalories,
    defaultPrice: chocolate.defaultPrice,
    rating: chocolate.rating,
    favorite: chocolate.favorite,
    buyAgain: chocolate.buyAgain,
  };
}

export function DarkDiaryProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<DarkDiaryStore>({
    chocolates: [],
    entries: [],
    settings: defaultSettings,
  });
  const [isHydrating, setIsHydrating] = useState(true);
  const storeRef = useRef(store);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  useEffect(() => {
    async function hydrate() {
      const nextStore = await loadStore();
      setStore(nextStore);
      storeRef.current = nextStore;
      setIsHydrating(false);
    }

    hydrate();
  }, []);

  async function commit(nextStore: DarkDiaryStore) {
    setStore(nextStore);
    storeRef.current = nextStore;
    await saveStore(nextStore);
  }

  async function saveEntry(date: string, draft: EntryDraft) {
    const current = storeRef.current;
    const dateEntries = current.entries.filter((entry) => entry.date === date);
    validateEntryDraft(draft, dateEntries);

    const timestamp = nowIso();
    const nextEntry: Entry = {
      id: createId("entry"),
      date,
      actionType: draft.actionType,
      chocolateId: draft.chocolateId,
      bars: draft.bars,
      grams: draft.grams,
      calories: draft.calories,
      spend: draft.spend,
      note: draft.note.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextEntries =
      draft.actionType === "no_chocolate"
        ? current.entries.filter((entry) => !(entry.date === date && entry.actionType === "no_chocolate"))
        : current.entries.filter((entry) => !(entry.date === date && entry.actionType === "no_chocolate"));

    await commit({
      ...current,
      entries: [...nextEntries, nextEntry],
    });
  }

  async function deleteEntry(entryId: string) {
    const current = storeRef.current;
    await commit({
      ...current,
      entries: current.entries.filter((entry) => entry.id !== entryId),
    });
  }

  async function saveChocolate(draft: ChocolateDraft, chocolateId?: string) {
    validateChocolateDraft(draft);
    const current = storeRef.current;
    const timestamp = nowIso();

    const baseChocolate: Chocolate = {
      id: chocolateId ?? createId("chocolate"),
      brand: draft.brand.trim(),
      productName: draft.productName.trim(),
      category: draft.category.trim(),
      cacaoPercent: draft.cacaoPercent,
      originCountry: draft.originCountry.trim(),
      flavorNotes: parseListText(draft.flavorNotesText),
      ingredients: parseListText(draft.ingredientsText),
      packageSizeGrams: draft.packageSizeGrams,
      defaultCalories: draft.defaultCalories,
      defaultPrice: draft.defaultPrice,
      rating: draft.rating,
      favorite: draft.favorite,
      buyAgain: draft.buyAgain,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const existing = current.chocolates.find((item) => item.id === baseChocolate.id);
    const nextChocolate = existing
      ? {
          ...baseChocolate,
          createdAt: existing.createdAt,
        }
      : baseChocolate;

    const nextChocolates = existing
      ? current.chocolates.map((item) => (item.id === nextChocolate.id ? nextChocolate : item))
      : [nextChocolate, ...current.chocolates];

    await commit({
      ...current,
      chocolates: nextChocolates,
    });

    return nextChocolate.id;
  }

  async function deleteChocolate(chocolateId: string) {
    const current = storeRef.current;
    await commit({
      chocolates: current.chocolates.filter((chocolate) => chocolate.id !== chocolateId),
      entries: current.entries.map((entry) =>
        entry.chocolateId === chocolateId
          ? {
              ...entry,
              chocolateId: null,
              updatedAt: nowIso(),
            }
          : entry,
      ),
      settings: current.settings,
    });
  }

  async function toggleFavorite(chocolateId: string) {
    const current = storeRef.current;
    await commit({
      ...current,
      chocolates: current.chocolates.map((chocolate) =>
        chocolate.id === chocolateId
          ? {
              ...chocolate,
              favorite: !chocolate.favorite,
              updatedAt: nowIso(),
            }
          : chocolate,
      ),
    });
  }

  async function toggleBuyAgain(chocolateId: string) {
    const current = storeRef.current;
    await commit({
      ...current,
      chocolates: current.chocolates.map((chocolate) =>
        chocolate.id === chocolateId
          ? {
              ...chocolate,
              buyAgain: !chocolate.buyAgain,
              updatedAt: nowIso(),
            }
          : chocolate,
      ),
    });
  }

  async function updateSettings(nextSettings: AppSettings) {
    const current = storeRef.current;
    await commit({
      ...current,
      settings: nextSettings,
    });
  }

  function getChocolate(chocolateId?: string | null) {
    if (!chocolateId) {
      return undefined;
    }
    return store.chocolates.find((chocolate) => chocolate.id === chocolateId);
  }

  function getDateSummary(date: string) {
    return summarizeDate(store.entries, date);
  }

  function getMonthSummary(anchor: Date) {
    return calculateMonthSummary(store.entries, store.chocolates, anchor);
  }

  async function resetWithSeedData() {
    const nextStore = createSeedStore();
    await commit(nextStore);
  }

  return (
    <DarkDiaryContext.Provider
      value={{
        store,
        isHydrating,
        saveEntry,
        deleteEntry,
        saveChocolate,
        deleteChocolate,
        toggleFavorite,
        toggleBuyAgain,
        updateSettings,
        getChocolate,
        getDateSummary,
        getMonthSummary,
        resetWithSeedData,
      }}
    >
      {children}
    </DarkDiaryContext.Provider>
  );
}

export function useDarkDiary() {
  const context = useContext(DarkDiaryContext);
  if (!context) {
    throw new Error("useDarkDiary must be used within a DarkDiaryProvider.");
  }
  return context;
}

export function useChocolateName(chocolateId: string | null) {
  const { store } = useDarkDiary();
  return chocolateNameById(store.chocolates, chocolateId);
}

