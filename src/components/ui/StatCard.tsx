import { StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../../ui/theme";

interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "accent" | "soft";
}

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <View style={[styles.card, tone === "accent" && styles.cardAccent, tone === "soft" && styles.cardSoft]}>
      <Text style={[styles.value, tone === "accent" && styles.valueAccent]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 120,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardAccent: {
    backgroundColor: "#F0E0D2",
  },
  cardSoft: {
    backgroundColor: palette.surfaceMuted,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.text,
  },
  valueAccent: {
    color: palette.chocolate,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
});

