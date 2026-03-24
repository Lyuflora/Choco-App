// Today turns logging into a small ritual first, then reveals details only if the user wants them.
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ChocolateBar, type ChocolateBarPhase } from "../../src/components/today/ChocolateBar";
import { ChoiceChipGroup } from "../../src/components/ui/ChoiceChipGroup";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { FormField } from "../../src/components/ui/FormField";
import { ListItemCard } from "../../src/components/ui/ListItemCard";
import { PrimaryButton } from "../../src/components/ui/PrimaryButton";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { SelectionField } from "../../src/components/ui/SelectionField";
import { createEmptyEntryDraft, useDarkDiary } from "../../src/store/app-provider";
import type { ActionType, Chocolate } from "../../src/types/models";
import { friendlyDate, todayDateKey } from "../../src/utils/date";
import { formatCurrency } from "../../src/utils/format";
import { chocolateNameById } from "../../src/utils/summary";
import { isChocolateAction, parseOptionalNumber } from "../../src/utils/validation";
import { palette, radii, spacing } from "../../src/ui/theme";

type RitualPhase = ChocolateBarPhase;

const ACTION_OPTIONS: { key: ActionType; label: string }[] = [
  { key: "eat", label: "Eat" },
  { key: "taste", label: "Taste" },
  { key: "purchase", label: "Purchase" },
  { key: "no_chocolate", label: "No Chocolate" },
];

const QUICK_BAR_OPTIONS = ["0.25", "0.5", "1"];

function saveLabelForAction(actionType: ActionType): string {
  switch (actionType) {
    case "taste":
      return "Save Tasting";
    case "purchase":
      return "Save Purchase";
    case "no_chocolate":
      return "Save No Chocolate Day";
    default:
      return "Save Bite";
  }
}

function successMessageForAction(actionType: ActionType): string {
  switch (actionType) {
    case "taste":
      return "Saved a tasting moment.";
    case "purchase":
      return "Saved today's chocolate purchase.";
    case "no_chocolate":
      return "Saved a no chocolate day.";
    default:
      return "Saved today's chocolate ritual.";
  }
}

function heroTitleForAction(actionType: ActionType): string {
  switch (actionType) {
    case "taste":
      return "You tasted chocolate 🍫";
    case "purchase":
      return "You bought chocolate 🍫";
    case "no_chocolate":
      return "No chocolate today";
    default:
      return "You had chocolate 🍫";
  }
}

function detailTextForChocolate(chocolate: Chocolate): string {
  const cacao = chocolate.cacaoPercent === null ? "?% cacao" : `${chocolate.cacaoPercent}% cacao`;
  return `${chocolate.category} / ${cacao}`;
}

function buildBadgeList(chocolateName: string): string[] {
  return chocolateName ? [chocolateName] : [];
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function TodayScreen() {
  const { store, isHydrating, saveEntry, getDateSummary } = useDarkDiary();
  const [ritualPhase, setRitualPhase] = useState<RitualPhase>("idle");
  const [showDetails, setShowDetails] = useState(false);
  const [actionType, setActionType] = useState<ActionType>("eat");
  const [selectedChocolateId, setSelectedChocolateId] = useState<string | null>(null);
  const [bars, setBars] = useState("");
  const [grams, setGrams] = useState("");
  const [calories, setCalories] = useState("");
  const [spend, setSpend] = useState("");
  const [note, setNote] = useState("");
  const [pickerVisible, setPickerVisible] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

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

  function resetDraftForNextEntry() {
    setActionType("eat");
    setBars("");
    setGrams("");
    setCalories(selectedChocolate?.defaultCalories === null || selectedChocolate?.defaultCalories === undefined ? "" : `${selectedChocolate.defaultCalories}`);
    setSpend("");
    setNote("");
    setShowDetails(false);
    setPickerVisible(false);
    setSavedMessage("");
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

  function handleBreakRequest() {
    if (ritualPhase !== "idle") {
      return;
    }

    setSavedMessage("");
    setActionType("eat");
    setRitualPhase("interacting");
  }

  async function handleSave() {
    try {
      await saveEntry(today, buildDraft());
      setSavedMessage(successMessageForAction(actionType));
      setRitualPhase("saved");
      setShowDetails(false);
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
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.kicker}>Chocolate Ritual</Text>
          <Text style={styles.heroTitle}>Break the bar, then log the moment.</Text>
        </View>

        <View style={styles.statRow}>
          <StatPill label="Entries" value={`${todaySummary.entries.length}`} />
          <StatPill label="Calories" value={`${todaySummary.totalCalories}`} />
          <StatPill label="Spend" value={formatCurrency(todaySummary.totalSpend, store.settings)} />
        </View>

        <ChocolateBar
          phase={ritualPhase}
          onBreakRequest={handleBreakRequest}
          onBreakComplete={() => setRitualPhase("logging")}
        />

        {ritualPhase === "idle" ? (
          <Text style={styles.idleText}>Start with the gesture. Details can wait until after the break.</Text>
        ) : null}

        {ritualPhase === "logging" ? (
          <View style={styles.logCard}>
            <Text style={styles.logTitle}>{heroTitleForAction(actionType)}</Text>
            <Text style={styles.logSubtitle}>Choose a quick amount or open details if you want context.</Text>

            {actionType === "eat" ? (
              <ChoiceChipGroup
                options={QUICK_BAR_OPTIONS.map((amount) => ({
                  key: amount,
                  label: `${amount} bar`,
                }))}
                selectedValue={bars}
                onSelect={setBars}
              />
            ) : (
              <View style={styles.helperCard}>
                <Text style={styles.helperTitle}>Quick amount is only for eating logs</Text>
                <Text style={styles.helperText}>Use the details section below if this was a tasting, purchase, or no chocolate day.</Text>
              </View>
            )}

            <PrimaryButton label={saveLabelForAction(actionType)} onPress={handleSave} />

            <Pressable style={styles.detailToggle} onPress={() => setShowDetails((current) => !current)}>
              <Text style={styles.detailToggleText}>{showDetails ? "Hide details" : "+ Add details"}</Text>
            </Pressable>
          </View>
        ) : null}

        {ritualPhase === "saved" ? (
          <View style={styles.savedCard}>
            <Text style={styles.savedTitle}>Saved</Text>
            <Text style={styles.savedText}>{savedMessage}</Text>
            <PrimaryButton
              label="Break Another Piece"
              onPress={() => {
                resetDraftForNextEntry();
                setRitualPhase("idle");
              }}
              tone="secondary"
            />
          </View>
        ) : null}

        {showDetails && ritualPhase === "logging" ? (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Add details</Text>
            <Text style={styles.detailsSubtitle}>Use this only when the quick log is not enough.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Log Type</Text>
              <ChoiceChipGroup
                options={ACTION_OPTIONS.map((option) => ({
                  key: option.key,
                  label: option.label,
                }))}
                selectedValue={actionType}
                onSelect={(value) => setActionType(value as ActionType)}
              />
            </View>

            {isChocolateAction(actionType) ? (
              <>
                {favoriteChocolates.length > 0 ? (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Favorites</Text>
                    <View style={styles.favoriteRow}>
                      {favoriteChocolates.map((chocolate) => {
                        const isSelected = chocolate.id === selectedChocolateId;

                        return (
                          <Pressable
                            key={chocolate.id}
                            style={[styles.favoriteChip, isSelected && styles.favoriteChipSelected]}
                            onPress={() => handleSelectChocolate(chocolate.id)}
                          >
                            <Text style={[styles.favoriteChipTitle, isSelected && styles.favoriteChipTitleSelected]}>
                              {chocolate.brand}
                            </Text>
                            <Text style={[styles.favoriteChipText, isSelected && styles.favoriteChipTextSelected]} numberOfLines={1}>
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
                    helperText="Optional. Leave it blank if you only want a quick personal log."
                  />
                ) : null}

                <View style={styles.row}>
                  <View style={styles.column}>
                    <FormField
                      label="Bars"
                      value={bars}
                      onChangeText={setBars}
                      keyboardType="decimal-pad"
                      helperText="Use the quick chips above or type your own amount."
                    />
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
                <Text style={styles.helperTitle}>A no chocolate day is valid data</Text>
                <Text style={styles.helperText}>Leave the numbers empty and add a short note only if it helps explain the day.</Text>
              </View>
            )}

            <FormField
              label="Note"
              value={note}
              onChangeText={setNote}
              multiline
              placeholder="Flavor, mood, store name, or what made today feel different."
            />
          </View>
        ) : null}
      </View>

      {todaySummary.entries.length === 0 ? (
        <EmptyState
          title="Nothing logged yet"
          description="Break the bar above to log today's chocolate without starting in a form."
        />
      ) : (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Today's Log</Text>
          <View style={styles.historyList}>
            {todaySummary.entries.map((entry) => {
              const chocolateName = entry.chocolateId ? chocolateNameById(store.chocolates, entry.chocolateId) : "";

              return (
                <ListItemCard
                  key={entry.id}
                  title={entry.actionType.replace("_", " ")}
                  subtitle={entry.note || chocolateName || "Quick entry"}
                  meta={renderEntryMeta(entry.actionType, entry.calories, entry.spend)}
                  badges={buildBadgeList(chocolateName)}
                />
              );
            })}
          </View>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heroHeader: {
    alignItems: "center",
    gap: spacing.xs,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: palette.chocolateSoft,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: palette.text,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statPill: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.textMuted,
  },
  idleText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textMuted,
    textAlign: "center",
  },
  logCard: {
    borderRadius: radii.md,
    backgroundColor: palette.card,
    padding: spacing.md,
    gap: spacing.md,
  },
  logTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
    textAlign: "center",
  },
  logSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textMuted,
    textAlign: "center",
  },
  detailToggle: {
    alignSelf: "center",
    paddingVertical: spacing.xs,
  },
  detailToggleText: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.chocolate,
  },
  detailsCard: {
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    gap: spacing.md,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  detailsSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textMuted,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
  favoriteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  favoriteChip: {
    flexBasis: "48%",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    padding: spacing.sm,
    gap: 4,
  },
  favoriteChipSelected: {
    backgroundColor: palette.chocolate,
    borderColor: palette.chocolate,
  },
  favoriteChipTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: palette.chocolate,
  },
  favoriteChipTitleSelected: {
    color: palette.surface,
  },
  favoriteChipText: {
    fontSize: 12,
    color: palette.textMuted,
  },
  favoriteChipTextSelected: {
    color: palette.surface,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  column: {
    flex: 1,
  },
  helperCard: {
    borderRadius: radii.md,
    backgroundColor: palette.surface,
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
  savedCard: {
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    gap: spacing.md,
  },
  savedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
    textAlign: "center",
  },
  savedText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textMuted,
    textAlign: "center",
  },
  historySection: {
    gap: spacing.sm,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  historyList: {
    gap: spacing.sm,
  },
});
