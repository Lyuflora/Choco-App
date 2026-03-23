// Settings holds the few personal preferences that shape budget, calorie, and display defaults across the whole app.
import { Alert, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { SegmentedControl } from "../../src/components/SegmentedControl";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { FormField } from "../../src/components/ui/FormField";
import { PrimaryButton } from "../../src/components/ui/PrimaryButton";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { defaultSettings } from "../../src/data/seed";
import { useDarkDiary } from "../../src/store/app-provider";
import { parseOptionalNumber } from "../../src/utils/validation";
import { palette, radii, spacing } from "../../src/ui/theme";

export default function SettingsScreen() {
  const { store, isHydrating, updateSettings, resetWithSeedData } = useDarkDiary();
  const [monthlyBudget, setMonthlyBudget] = useState(`${store.settings.monthlyBudget}`);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(`${store.settings.dailyCalorieGoal}`);
  const [preferredUnit, setPreferredUnit] = useState(store.settings.preferredUnit);
  const [currency, setCurrency] = useState(store.settings.currency);

  useEffect(() => {
    setMonthlyBudget(`${store.settings.monthlyBudget}`);
    setDailyCalorieGoal(`${store.settings.dailyCalorieGoal}`);
    setPreferredUnit(store.settings.preferredUnit);
    setCurrency(store.settings.currency);
  }, [store.settings]);

  async function handleSave() {
    try {
      await updateSettings({
        monthlyBudget: parseOptionalNumber(monthlyBudget) ?? 0,
        dailyCalorieGoal: parseOptionalNumber(dailyCalorieGoal) ?? 0,
        preferredUnit,
        currency,
      });
      Alert.alert("Saved", "Your settings were stored on this device.");
    } catch (error) {
      Alert.alert("Could not save settings", error instanceof Error ? error.message : "Try again.");
    }
  }

  async function handleReset() {
    await resetWithSeedData();
    setMonthlyBudget(`${defaultSettings.monthlyBudget}`);
    setDailyCalorieGoal(`${defaultSettings.dailyCalorieGoal}`);
    setPreferredUnit(defaultSettings.preferredUnit);
    setCurrency(defaultSettings.currency);
    Alert.alert("Seed data restored", "Example chocolates and entries have been reloaded.");
  }

  if (isHydrating) {
    return (
      <ScreenShell title="Settings" subtitle="Loading local preferences...">
        <EmptyState title="Loading settings" description="Your budget, calorie, and display preferences are loading." />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Settings" subtitle="Budget, calories, units, and currency.">
      <View style={styles.card}>
        <FormField
          label="Monthly Chocolate Budget"
          value={monthlyBudget}
          onChangeText={setMonthlyBudget}
          keyboardType="decimal-pad"
        />
        <FormField
          label="Daily Calorie Goal"
          value={dailyCalorieGoal}
          onChangeText={setDailyCalorieGoal}
          keyboardType="decimal-pad"
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Preferred Unit</Text>
          <SegmentedControl
            value={preferredUnit}
            onChange={setPreferredUnit}
            options={[
              { key: "grams", label: "Grams" },
              { key: "bars", label: "Bars" },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Currency</Text>
          <SegmentedControl
            value={currency}
            onChange={setCurrency}
            options={[
              { key: "USD", label: "USD" },
              { key: "EUR", label: "EUR" },
              { key: "GBP", label: "GBP" },
            ]}
          />
        </View>

        <PrimaryButton label="Save Settings" onPress={handleSave} />
        <PrimaryButton label="Reload Seed Data" onPress={handleReset} tone="secondary" />
      </View>
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
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
});
