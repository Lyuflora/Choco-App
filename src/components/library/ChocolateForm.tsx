// ChocolateForm centralizes the long library form so create and edit screens stay nearly identical and easier to maintain.
import { StyleSheet, Text, View } from "react-native";
import { SegmentedControl } from "../SegmentedControl";
import { FormField } from "../ui/FormField";
import { PrimaryButton } from "../ui/PrimaryButton";
import { palette, radii, spacing } from "../../ui/theme";

export interface ChocolateFormValues {
  brand: string;
  productName: string;
  category: string;
  cacaoPercent: string;
  originCountry: string;
  flavorNotesText: string;
  ingredientsText: string;
  packageSizeGrams: string;
  defaultCalories: string;
  defaultPrice: string;
  rating: string;
  favorite: boolean;
  buyAgain: boolean;
}

interface ChocolateFormProps {
  values: ChocolateFormValues;
  onChange: <K extends keyof ChocolateFormValues>(field: K, value: ChocolateFormValues[K]) => void;
  onSave: () => void;
  onDelete?: () => void;
  saveLabel: string;
}

export function ChocolateForm({ values, onChange, onSave, onDelete, saveLabel }: ChocolateFormProps) {
  return (
    <View style={styles.card}>
      <FormField label="Brand" value={values.brand} onChangeText={(value) => onChange("brand", value)} />
      <FormField
        label="Product Name"
        value={values.productName}
        onChangeText={(value) => onChange("productName", value)}
      />
      <FormField label="Category" value={values.category} onChangeText={(value) => onChange("category", value)} />

      <View style={styles.row}>
        <View style={styles.column}>
          <FormField
            label="Cacao %"
            value={values.cacaoPercent}
            onChangeText={(value) => onChange("cacaoPercent", value)}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.column}>
          <FormField
            label="Origin Country"
            value={values.originCountry}
            onChangeText={(value) => onChange("originCountry", value)}
          />
        </View>
      </View>

      <FormField
        label="Flavor Notes"
        value={values.flavorNotesText}
        onChangeText={(value) => onChange("flavorNotesText", value)}
        placeholder="berry, floral, roasted"
      />
      <FormField
        label="Ingredients"
        value={values.ingredientsText}
        onChangeText={(value) => onChange("ingredientsText", value)}
        placeholder="cocoa mass, sugar"
      />

      <View style={styles.row}>
        <View style={styles.column}>
          <FormField
            label="Package Size (g)"
            value={values.packageSizeGrams}
            onChangeText={(value) => onChange("packageSizeGrams", value)}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.column}>
          <FormField
            label="Default Calories"
            value={values.defaultCalories}
            onChangeText={(value) => onChange("defaultCalories", value)}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.column}>
          <FormField
            label="Default Price"
            value={values.defaultPrice}
            onChangeText={(value) => onChange("defaultPrice", value)}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.column}>
          <FormField
            label="Rating"
            value={values.rating}
            onChangeText={(value) => onChange("rating", value)}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.flagSection}>
        <Text style={styles.flagLabel}>Favorite</Text>
        <SegmentedControl
          value={values.favorite ? "yes" : "no"}
          onChange={(value) => onChange("favorite", value === "yes")}
          options={[
            { key: "yes", label: "Yes" },
            { key: "no", label: "No" },
          ]}
        />
      </View>

      <View style={styles.flagSection}>
        <Text style={styles.flagLabel}>Buy Again</Text>
        <SegmentedControl
          value={values.buyAgain ? "yes" : "no"}
          onChange={(value) => onChange("buyAgain", value === "yes")}
          options={[
            { key: "yes", label: "Yes" },
            { key: "no", label: "No" },
          ]}
        />
      </View>

      <PrimaryButton label={saveLabel} onPress={onSave} />
      {onDelete ? <PrimaryButton label="Delete Chocolate" onPress={onDelete} tone="danger" /> : null}
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
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  column: {
    flex: 1,
  },
  flagSection: {
    gap: spacing.xs,
  },
  flagLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
});
