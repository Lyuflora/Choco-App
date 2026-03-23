import { Pressable, StyleSheet, Text } from "react-native";
import { palette, radii, spacing } from "../../ui/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "danger";
}

export function PrimaryButton({ label, onPress, tone = "primary" }: PrimaryButtonProps) {
  return (
    <Pressable
      style={[styles.button, tone === "secondary" && styles.secondary, tone === "danger" && styles.danger]}
      onPress={onPress}
    >
      <Text style={[styles.label, tone !== "primary" && styles.labelDark]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.pill,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    backgroundColor: palette.chocolate,
  },
  secondary: {
    backgroundColor: palette.surfaceMuted,
  },
  danger: {
    backgroundColor: "#F5DDD8",
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.surface,
  },
  labelDark: {
    color: palette.text,
  },
});

