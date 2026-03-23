import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MonthCalendar } from "../../src/components/calendar/MonthCalendar";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ListItemCard } from "../../src/components/ui/ListItemCard";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { StatCard } from "../../src/components/ui/StatCard";
import { useDarkDiary } from "../../src/store/app-provider";
import { friendlyDate, monthLabel, todayDateKey } from "../../src/utils/date";
import { formatCurrency } from "../../src/utils/format";
import { buildCalendarCells, chocolateNameById } from "../../src/utils/summary";
import { palette, radii, spacing } from "../../src/ui/theme";

export default function CalendarScreen() {
  const { store, isHydrating, getDateSummary, getMonthSummary } = useDarkDiary();
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayDateKey());

  const monthSummary = getMonthSummary(month);
  const calendarCells = buildCalendarCells(store.entries, month);
  const selectedSummary = getDateSummary(selectedDate);

  function shiftMonth(direction: -1 | 1) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  }

  if (isHydrating) {
    return (
      <ScreenShell title="Calendar" subtitle="Loading your monthly view...">
        <EmptyState title="Preparing month view" description="Entries are loading from local storage." />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Calendar" subtitle="Scan your chocolate rhythm by month.">
      <View style={styles.monthSwitcher}>
        <Pressable style={styles.arrowButton} onPress={() => shiftMonth(-1)}>
          <Text style={styles.arrowText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{monthLabel(month)}</Text>
        <Pressable style={styles.arrowButton} onPress={() => shiftMonth(1)}>
          <Text style={styles.arrowText}>{">"}</Text>
        </Pressable>
      </View>

      <View style={styles.gridStats}>
        <StatCard label="Chocolate Days" value={`${monthSummary.chocolateDays}`} tone="accent" />
        <StatCard label="Calories" value={`${monthSummary.totalCalories}`} />
      </View>
      <View style={styles.gridStats}>
        <StatCard label="Spend" value={formatCurrency(monthSummary.totalSpend, store.settings)} />
        <StatCard label="No-Choco Streak" value={`${monthSummary.noChocolateStreak}`} tone="soft" />
      </View>

      <MonthCalendar cells={calendarCells} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>{friendlyDate(selectedDate)}</Text>
        <Text style={styles.detailSubtitle}>
          {selectedSummary.entries.length === 0
            ? "No entries recorded for this day."
            : `${selectedSummary.entries.length} entries · ${selectedSummary.totalCalories} kcal · ${formatCurrency(
                selectedSummary.totalSpend,
                store.settings,
              )}`}
        </Text>
      </View>

      {selectedSummary.entries.length === 0 ? (
        <EmptyState title="No logs for this date" description="Tap another day or create an entry from the Today tab." />
      ) : (
        <View style={styles.list}>
          {selectedSummary.entries.map((entry) => (
            <ListItemCard
              key={entry.id}
              title={entry.actionType.replace("_", " ")}
              subtitle={entry.note || chocolateNameById(store.chocolates, entry.chocolateId)}
              meta={
                entry.actionType === "purchase"
                  ? formatCurrency(entry.spend ?? 0, store.settings)
                  : `${entry.grams ?? 0} g`
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
  monthSwitcher: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  arrowButton: {
    width: 36,
    alignItems: "center",
  },
  arrowText: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.chocolate,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
  },
  gridStats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  detailCard: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text,
  },
  detailSubtitle: {
    fontSize: 13,
    color: palette.textMuted,
  },
  list: {
    gap: spacing.sm,
  },
});

