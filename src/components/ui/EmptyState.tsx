import { StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../../ui/theme";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: "dashed",
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: palette.text,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.textMuted,
  },
});

