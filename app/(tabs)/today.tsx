// Today is the fastest logging screen in the app, so it prefers one-screen actions and reusable defaults over dense forms.
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SegmentedControl } from "../../src/components/SegmentedControl";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { FormField } from "../../src/components/ui/FormField";
import { ListItemCard } from "../../src/components/ui/ListItemCard";
import { PrimaryButton } from "../../src/components/ui/PrimaryButton";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { SelectionField } from "../../src/components/ui/SelectionField";
import { StatCard } from "../../src/components/ui/StatCard";
import { createEmptyEntryDraft, useDarkDiary } from "../../src/store/app-provider";
import type { ActionType, Chocolate } from "../../src/types/models";
import { friendlyDate, todayDateKey } from "../../src/utils/date";
import { formatCurrency } from "../../src/utils/format";
import { chocolateNameById } from "../../src/utils/summary";
import { isChocolateAction, parseOptionalNumber } from "../../src/utils/validation";
import { palette, radii, spacing } from "../../src/ui/theme";

const ACTION_OPTIONS: { key: ActionType; label: string }[] = [
  { key: "eat", label: "Eat" },
  { key: "taste", label: "Taste" },
  { key: "purchase", label: "Purchase" },
  { key: "no_chocolate", label: "No Chocolate" },
];

function saveLabelForAction(actionType: ActionType): string {
  switch (actionType) {
    case "taste":
      return "Save Tasting";
    case "purchase":
      return "Save Purchase";
    case "no_chocolate":
      return "Save No Chocolate Day";
    default:
      return "Save Eat";
  }
}

function successMessageForAction(actionType: ActionType): string {
  switch (actionType) {
    case "taste":
      return "Saved a tasting note.";
    case "purchase":
      return "Saved a purchase.";
    case "no_chocolate":
      return "Saved a no chocolate day.";
    default:
      return "Saved an eating entry.";
  }
}

function detailTextForChocolate(chocolate: Chocolate): string {
  const cacao = chocolate.cacaoPercent === null ? "?% cacao" : `${chocolate.cacaoPercent}% cacao`;
  return `${chocolate.category} / ${cacao}`;
}

export default function TodayScreen() {
  const { store, isHydrating, saveEntry, getDateSummary } = useDarkDiary();
  const [actionType, setActionType] = useState<ActionType>("eat");
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const [bars, setBars] = useState("");
  const [grams, setGrams] = useState("");
  const [calories, setCalories] = useState("");
  const [spend, setSpend] = useState("");
  const [note, setNote] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [lastSavedMessage, setLastSavedMessage] = useState("");

  const today = todayDateKey();
  const todaySummary = getDateSummary(today);
  const favoriteChocolates = useMemo(
    () => store.chocolates.filter((chocolate) => chocolate.favorite).slice(0, 4),
    [store.chocolates],
  );
  const selectedChocolate = store.chocolates.find((chocolate) => chocolate.id === selectedChocolateId);

  useEffect(() => {
    if (!selectedChocolate || !isChocolateAction(actionType)) {
      return;
    }

    applyChocolateDefaults(selectedChocolate, actionType);
  }, [actionType, selectedChocolate]);

  function applyChocolateDefaults(chocolate: Chocolate, nextActionType: ActionType) {
    if (nextActionType === "purchase") {
      if (!grams && chocolate.packageSizeGrams !== null) {
        setGrams(`${chocolate.packageSizeGrams}`);
      }

      if (!spend && chocolate.defaultPrice !== null) {
        setSpend(`${chocolate.defaultPrice}`);
      }

      return;
    }

    if (!calories && chocolate.defaultCalories !== null) {
      setCalories(`${chocolate.defaultCalories}`);
    }
  }

  function resetFieldsAfterSave(savedAction: ActionType, chocolate: Chocolate | undefined) {
    setBars("");
    setNote("");

    if (savedAction === "no_chocolate") {
      setGrams("");
      setCalories("");
      setSpend("");
      return;
    }

    if (savedAction === "purchase") {
      setCalories("");
      setGrams(chocolate?.packageSizeGrams === null || chocolate?.packageSizeGrams === undefined ? "" : `${chocolate.packageSizeGrams}`);
      setSpend(chocolate?.defaultPrice === null || chocolate?.defaultPrice === undefined ? "" : `${chocolate.defaultPrice}`);
      return;
    }

    setSpend("");
    setGrams("");
    setCalories(chocolate?.defaultCalories === null || chocolate?.defaultCalories === undefined ? "" : `${chocolate.defaultCalories}`);
  }

  function buildDraft() {
    const draft = createEmptyEntryDraft();
    draft.actionType = actionType;
    draft.chocolateId = isChocolateAction(actionType) ? selectedChocolateId : null;
    draft.bars = isChocolateAction(actionType) ? parseOptionalNumber(bars) : null;
    draft.grams = isChocolateAction(actionType) ? parseOptionalNumber(grams) : null;
    draft.calories = actionType === "eat" || actionType === "taste" ? parseOptionalNumber(calories) : null;
    draft.spend = actionType === "purchase" ? parseOptionalNumber(spend) : null;
    draft.note = note;
    return draft;
  }

  async function handleSave() {
    try {
      await saveEntry(today, buildDraft());
      setLastSavedMessage(successMessageForAction(actionType));
      resetFieldsAfterSave(actionType, selectedChocolate);
    } catch (error) {
      Alert.alert("Could not save entry", error instanceof Error ? error.message : "Try again.");
    }
  }

  function handleSelectChocolate(chocolateId: string | null) {
    setPickerVisible(false);
    setSelectedChocolateId(chocolateId);

    if (!chocolateId) {
      return;
    }

    const chocolate = store.chocolates.find((item) => item.id === chocolateId);
    if (!chocolate) {
      return;
    }

    applyChocolateDefaults(chocolate, actionType);
  }

  function renderEntryMeta(action: ActionType, entryCalories: number | null, entrySpend: number | null) {
    if (action === "purchase") {
      return formatCurrency(entrySpend ?? 0, store.settings);
    }

    if (action === "no_chocolate") {
      return "Reset day";
    }

    return `${entryCalories ?? 0} kcal`;
  }

  if (isHydrating) {
    return (
      <ScreenShell title="Today" subtitle="Loading your chocolate diary...">
        <EmptyState title="Hydrating local diary" description="Your saved entries are being loaded from this device." />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Today" subtitle={friendlyDate(today)}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Log</Text>
        <SegmentedControl value={actionType} onChange={setActionType} options={ACTION_OPTIONS} />

        {isChocolateAction(actionType) ? (
          <>
            {favoriteChocolates.length > 0 ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Favorites</Text>
                <View style={styles.quickChipRow}>
                  {favoriteChocolates.map((chocolate) => {
                    const isSelected = chocolate.id === selectedChocolateId;

                    return (
                      <Pressable
                        key={chocolate.id}
                        style={[styles.quickChip, isSelected && styles.quickChipSelected]}
                        onPress={() => handleSelectChocolate(chocolate.id)}
                      >
                        <Text style={[styles.quickChipTitle, isSelected && styles.quickChipTitleSelected]}>
                          {chocolate.brand}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={[styles.quickChipText, isSelected && styles.quickChipTextSelected]}
                        >
                          {chocolate.productName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {store.chocolates.length > 0 ? (
              <SelectionField
                label="Chocolate"
                selectedLabel={chocolateNameById(store.chocolates, selectedChocolateId)}
                options={store.chocolates.map((chocolate) => ({
                  id: chocolate.id,
                  label: `${chocolate.brand} ${chocolate.productName}`,
                  detail: detailTextForChocolate(chocolate),
                }))}
                visible={pickerVisible}
                onOpen={() => setPickerVisible(true)}
                onClose={() => setPickerVisible(false)}
                onSelect={handleSelectChocolate}
              />
            ) : (
              <View style={styles.helperCard}>
                <Text style={styles.helperTitle}>No chocolates in your library yet</Text>
                <Text style={styles.helperText}>You can still log a quick entry now, then add favorite bars later.</Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={styles.column}>
                <FormField label="Bars" value={bars} onChangeText={setBars} keyboardType="decimal-pad" />
              </View>
              <View style={styles.column}>
                <FormField label="Grams" value={grams} onChangeText={setGrams} keyboardType="decimal-pad" />
              </View>
            </View>

            {actionType === "purchase" ? (
              <FormField label="Spend" value={spend} onChangeText={setSpend} keyboardType="decimal-pad" />
            ) : (
              <FormField label="Calories" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" />
            )}
          </>
        ) : (
          <View style={styles.helperCard}>
            <Text style={styles.helperTitle}>Simple reset day</Text>
            <Text style={styles.helperText}>Add a short note if you want context, then save the day in one tap.</Text>
          </View>
        )}

        <FormField
          label="Note"
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Flavor, mood, store name, or what made today feel different."
        />

        <PrimaryButton label={saveLabelForAction(actionType)} onPress={handleSave} />
        {lastSavedMessage ? <Text style={styles.savedText}>{lastSavedMessage}</Text> : null}
      </View>

      <View style={styles.statRow}>
        <StatCard label="Entries Today" value={`${todaySummary.entries.length}`} tone="soft" />
        <StatCard label="Calories" value={`${todaySummary.totalCalories}`} tone="accent" />
      </View>
      <View style={styles.statRow}>
        <StatCard label="Spend" value={formatCurrency(todaySummary.totalSpend, store.settings)} />
        <StatCard label="Grams" value={`${todaySummary.totalGrams} g`} />
      </View>

      {todaySummary.entries.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          description="Use the quick log above to record chocolate, tasting notes, purchases, or a no chocolate day."
        />
      ) : (
        <View style={styles.list}>
          {todaySummary.entries.map((entry) => {
            const chocolateName = entry.chocolateId ? chocolateNameById(store.chocolates, entry.chocolateId) : "";

            return (
              <ListItemCard
                key={entry.id}
                title={entry.actionType.replace("_", " ")}
                subtitle={entry.note || chocolateName || "Quick entry"}
                meta={renderEntryMeta(entry.actionType, entry.calories, entry.spend)}
                badges={chocolateName ? [chocolateName] : []}
              />
            );
          })}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  column: {
    flex: 1,
  },
  quickChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickChip: {
    flexBasis: "48%",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.sm,
    gap: 4,
  },
  quickChipSelected: {
    backgroundColor: palette.chocolate,
    borderColor: palette.chocolate,
  },
  quickChipTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: palette.chocolate,
  },
  quickChipTitleSelected: {
    color: palette.surface,
  },
  quickChipText: {
    fontSize: 12,
    color: palette.textMuted,
  },
  quickChipTextSelected: {
    color: palette.surface,
  },
  helperCard: {
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
  },
  helperTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.text,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textMuted,
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  savedText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.chocolateSoft,
  },
  list: {
    gap: spacing.sm,
  },
});
