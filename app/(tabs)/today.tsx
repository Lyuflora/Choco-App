import { Alert, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { FormField } from "../../src/components/ui/FormField";
import { ListItemCard } from "../../src/components/ui/ListItemCard";
import { PrimaryButton } from "../../src/components/ui/PrimaryButton";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { SelectionField } from "../../src/components/ui/SelectionField";
import { StatCard } from "../../src/components/ui/StatCard";
import { SegmentedControl } from "../../src/components/SegmentedControl";
import { createEmptyEntryDraft, useDarkDiary } from "../../src/store/app-provider";
import { friendlyDate, todayDateKey } from "../../src/utils/date";
import { formatCurrency } from "../../src/utils/format";
import { chocolateNameById } from "../../src/utils/summary";
import { parseOptionalNumber } from "../../src/utils/validation";
import { palette, radii, spacing } from "../../src/ui/theme";

export default function TodayScreen() {
  const { store, isHydrating, saveEntry, getDateSummary } = useDarkDiary();
  const [dayChoice, setDayChoice] = useState<"had" | "none">("had");
  const [actionType, setActionType] = useState<"eat" | "taste" | "purchase">("eat");
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

  async function handleSave() {
    try {
      const draft = createEmptyEntryDraft();
      draft.actionType = dayChoice === "none" ? "no_chocolate" : actionType;
      draft.chocolateId = dayChoice === "none" ? null : selectedChocolateId;
      draft.bars = dayChoice === "none" ? null : parseOptionalNumber(bars);
      draft.grams = dayChoice === "none" ? null : parseOptionalNumber(grams);
      draft.calories = dayChoice === "none" ? null : parseOptionalNumber(calories);
      draft.spend = dayChoice === "none" ? null : parseOptionalNumber(spend);
      draft.note = note;

      await saveEntry(today, draft);
      setLastSavedMessage(dayChoice === "none" ? "Saved a no chocolate day." : `Saved a ${actionType} entry.`);

      if (dayChoice === "had") {
        setBars("");
        setGrams("");
        setCalories("");
        setSpend("");
        setNote("");
      } else {
        setNote("");
      }
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

    if (!calories && chocolate.defaultCalories !== null) {
      setCalories(`${chocolate.defaultCalories}`);
    }

    if (!spend && chocolate.defaultPrice !== null && actionType === "purchase") {
      setSpend(`${chocolate.defaultPrice}`);
    }
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
        <Text style={styles.sectionTitle}>Daily Check-in</Text>
        <SegmentedControl
          value={dayChoice}
          onChange={(value) => setDayChoice(value)}
          options={[
            { key: "had", label: "Had Chocolate" },
            { key: "none", label: "No Chocolate" },
          ]}
        />

        {dayChoice === "had" ? (
          <>
            <SegmentedControl
              value={actionType}
              onChange={(value) => setActionType(value)}
              options={[
                { key: "eat", label: "Eat" },
                { key: "taste", label: "Taste" },
                { key: "purchase", label: "Purchase" },
              ]}
            />

            <SelectionField
              label="Chocolate"
              selectedLabel={chocolateNameById(store.chocolates, selectedChocolateId)}
              options={store.chocolates.map((chocolate) => ({
                id: chocolate.id,
                label: `${chocolate.brand} ${chocolate.productName}`,
                detail: `${chocolate.category} · ${chocolate.cacaoPercent ?? "?"}%`,
              }))}
              visible={pickerVisible}
              onOpen={() => setPickerVisible(true)}
              onClose={() => setPickerVisible(false)}
              onSelect={handleSelectChocolate}
            />

            <View style={styles.row}>
              <View style={styles.column}>
                <FormField label="Bars" value={bars} onChangeText={setBars} keyboardType="decimal-pad" />
              </View>
              <View style={styles.column}>
                <FormField label="Grams" value={grams} onChangeText={setGrams} keyboardType="decimal-pad" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <FormField
                  label="Calories"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.column}>
                <FormField label="Spend" value={spend} onChangeText={setSpend} keyboardType="decimal-pad" />
              </View>
            </View>
          </>
        ) : null}

        <FormField
          label="Note"
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Mood, flavor, where you bought it, or why today was a no chocolate day."
        />

        <PrimaryButton label="Save Event" onPress={handleSave} />
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
          description="Use the check-in above to record today's chocolate, tasting note, purchase, or a no chocolate day."
        />
      ) : (
        <View style={styles.list}>
          {todaySummary.entries.map((entry) => (
            <ListItemCard
              key={entry.id}
              title={entry.actionType.replace("_", " ")}
              subtitle={entry.note || chocolateNameById(store.chocolates, entry.chocolateId)}
              meta={
                entry.actionType === "purchase"
                  ? formatCurrency(entry.spend ?? 0, store.settings)
                  : `${entry.calories ?? 0} kcal`
              }
              badges={[
                entry.chocolateId ? chocolateNameById(store.chocolates, entry.chocolateId) : "No chocolate selected",
              ]}
            />
          ))}
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
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  column: {
    flex: 1,
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

