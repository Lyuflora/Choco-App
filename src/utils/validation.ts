import type { ActionType, ChocolateDraft, Entry, EntryDraft } from "../types/models";

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new Error("Please enter a valid number.");
  }

  if (parsed < 0) {
    throw new Error("Numbers cannot be negative.");
  }

  return parsed;
}

export function parseListText(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateEntryDraft(draft: EntryDraft, existingEntriesForDate: Entry[]): void {
  if (draft.actionType === "no_chocolate") {
    const hasChocolateEvent = existingEntriesForDate.some((entry) => entry.actionType !== "no_chocolate");
    if (hasChocolateEvent) {
      throw new Error("This day already has chocolate activity. Remove those entries before marking no chocolate.");
    }
    return;
  }

  const hasMeaningfulInput =
    draft.chocolateId ||
    draft.bars !== null ||
    draft.grams !== null ||
    draft.calories !== null ||
    draft.spend !== null ||
    draft.note.trim().length > 0;

  if (!hasMeaningfulInput) {
    throw new Error("Add at least one detail before saving an entry.");
  }
}

export function validateChocolateDraft(draft: ChocolateDraft): void {
  if (!draft.brand.trim()) {
    throw new Error("Brand is required.");
  }

  if (!draft.productName.trim()) {
    throw new Error("Product name is required.");
  }

  if (!draft.category.trim()) {
    throw new Error("Category is required.");
  }
}

export function isChocolateAction(actionType: ActionType): boolean {
  return actionType !== "no_chocolate";
}

