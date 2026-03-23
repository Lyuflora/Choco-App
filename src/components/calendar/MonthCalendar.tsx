import { Pressable, StyleSheet, Text, View } from "react-native";
import { CALENDAR_WEEKDAYS } from "../../utils/date";
import type { CalendarCell } from "../../types/models";
import { palette, radii, spacing } from "../../ui/theme";

interface MonthCalendarProps {
  cells: CalendarCell[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function MonthCalendar({ cells, selectedDate, onSelectDate }: MonthCalendarProps) {
  return (
    <View style={styles.card}>
      <View style={styles.weekHeader}>
        {CALENDAR_WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekHeaderText}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = cell.date === selectedDate;
          const dotStyle = cell.isNoChocolateOnly ? styles.dotNoChocolate : cell.hasEntry ? styles.dotEntry : styles.dotEmpty;

          return (
            <Pressable
              key={cell.date}
              style={[styles.cell, isSelected && styles.cellSelected, !cell.inCurrentMonth && styles.cellMuted]}
              onPress={() => onSelectDate(cell.date)}
            >
              <Text style={styles.dayText}>{cell.dayNumber}</Text>
              <View style={[styles.dot, dotStyle]} />
              <Text style={styles.countText}>{cell.hasEntry ? `${cell.entryCount} log` : "-"}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  weekHeader: {
    flexDirection: "row",
  },
  weekHeaderText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.xs,
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: radii.sm,
  },
  cellSelected: {
    backgroundColor: palette.surfaceMuted,
  },
  cellMuted: {
    opacity: 0.45,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.text,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: radii.pill,
  },
  dotEntry: {
    backgroundColor: palette.chocolateSoft,
  },
  dotNoChocolate: {
    backgroundColor: palette.green,
  },
  dotEmpty: {
    backgroundColor: palette.backgroundAlt,
  },
  countText: {
    fontSize: 9,
    fontWeight: "700",
    color: palette.textMuted,
  },
});

