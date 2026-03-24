import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../../ui/theme";

interface ChoiceChipOption {
  key: string;
  label: string;
}

interface ChoiceChipGroupProps {
  options: ChoiceChipOption[];
  selectedValue?: string | null;
  onSelect: (value: string) => void;
}

export function ChoiceChipGroup({ options, selectedValue, onSelect }: ChoiceChipGroupProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <View style={styles.group}>
      {options.map((option) => {
        const isSelected = option.key === selectedValue;

        return (
          <Pressable
            key={option.key}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(option.key)}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: palette.chocolate,
    borderColor: palette.chocolate,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.chocolate,
  },
  chipTextSelected: {
    color: palette.surface,
  },
});
