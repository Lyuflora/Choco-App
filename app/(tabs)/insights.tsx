import { StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { StatCard } from "../../src/components/ui/StatCard";
import { useDarkDiary } from "../../src/store/app-provider";
import { monthLabel } from "../../src/utils/date";
import { formatCurrency } from "../../src/utils/format";
import { palette, radii, spacing } from "../../src/ui/theme";

export default function InsightsScreen() {
  const { store, isHydrating, getMonthSummary } = useDarkDiary();
  const anchor = new Date();
  const summary = getMonthSummary(anchor);

  if (isHydrating) {
    return (
      <ScreenShell title="Insights" subtitle="Crunching this month's chocolate data...">
        <EmptyState title="Building insights" description="Your local entries are being summarised." />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Insights" subtitle={`Current month · ${monthLabel(anchor)}`}>
      <View style={styles.grid}>
        <StatCard label="Bars Eaten" value={`${summary.totalBars}`} tone="accent" />
        <StatCard label="Grams Consumed" value={`${summary.totalGrams} g`} />
      </View>
      <View style={styles.grid}>
        <StatCard label="Calories" value={`${summary.totalCalories}`} />
        <StatCard label="Spend" value={formatCurrency(summary.totalSpend, store.settings)} tone="soft" />
      </View>
      <View style={styles.grid}>
        <StatCard label="Most Frequent Brand" value={summary.mostFrequentBrand} />
        <StatCard
          label="Avg Spend / Chocolate Day"
          value={formatCurrency(summary.averageSpendPerChocolateDay, store.settings)}
        />
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>What this says</Text>
        <Text style={styles.noteText}>
          Use spend and average-per-day together to see whether your exploration habit still feels intentional. A rising
          calories total with a flat chocolate-day count usually means portion size is drifting up.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  noteCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textMuted,
  },
});

