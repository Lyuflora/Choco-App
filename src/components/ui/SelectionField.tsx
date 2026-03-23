// SelectionField provides a simple bottom-sheet picker for choosing one item from a saved list, like chocolates from the library.
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../../ui/theme";

interface SelectionOption {
  id: string;
  label: string;
  detail?: string;
}

interface SelectionFieldProps {
  label: string;
  selectedLabel: string;
  options: SelectionOption[];
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (id: string | null) => void;
}

export function SelectionField({
  label,
  selectedLabel,
  options,
  visible,
  onOpen,
  onClose,
  onSelect,
}: SelectionFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.trigger} onPress={onOpen}>
        <Text style={styles.triggerText}>{selectedLabel}</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable style={styles.clearButton} onPress={() => onSelect(null)}>
              <Text style={styles.clearText}>Clear selection</Text>
            </Pressable>
            <ScrollView contentContainerStyle={styles.list}>
              {options.map((option) => (
                <Pressable key={option.id} style={styles.optionRow} onPress={() => onSelect(option.id)}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {option.detail ? <Text style={styles.optionDetail}>{option.detail}</Text> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
  trigger: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  triggerText: {
    color: palette.text,
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(26, 15, 10, 0.32)",
  },
  sheet: {
    backgroundColor: palette.surface,
    padding: spacing.lg,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    gap: spacing.sm,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  clearButton: {
    alignSelf: "flex-start",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.chocolateSoft,
  },
  list: {
    gap: spacing.sm,
  },
  optionRow: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: palette.text,
  },
  optionDetail: {
    fontSize: 12,
    color: palette.textMuted,
  },
});
