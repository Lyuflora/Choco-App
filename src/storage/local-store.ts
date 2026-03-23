import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSeedStore, defaultSettings } from "../data/seed";
import type { DarkDiaryStore } from "../types/models";

const STORAGE_KEY = "dark-diary-store-v1";

function normalizeStore(value: Partial<DarkDiaryStore> | null): DarkDiaryStore {
  return {
    chocolates: value?.chocolates ?? [],
    entries: value?.entries ?? [],
    settings: value?.settings ?? defaultSettings,
  };
}

// The MVP keeps all app data in one document so hydration and persistence stay easy to follow.
export async function loadStore(): Promise<DarkDiaryStore> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const seededStore = createSeedStore();
    await saveStore(seededStore);
    return seededStore;
  }

  const parsed = JSON.parse(raw) as Partial<DarkDiaryStore>;
  return normalizeStore(parsed);
}

export async function saveStore(store: DarkDiaryStore): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

