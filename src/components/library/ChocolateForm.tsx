// ChocolateForm centralizes the long library form so create and edit screens stay nearly identical and easier to maintain.
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { commonCacaoPercents, commonChocolateCategories, commonFlavorNotes, commonOriginCountries } from "../../data/chocolate-options";
import type { Chocolate } from "../../types/models";
import { palette, radii, spacing } from "../../ui/theme";
import { SegmentedControl } from "../SegmentedControl";
import { ChoiceChipGroup } from "../ui/ChoiceChipGroup";
import { FormField } from "../ui/FormField";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SelectionField } from "../ui/SelectionField";

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
  existingChocolates: Chocolate[];
  onChange: <K extends keyof ChocolateFormValues>(field: K, value: ChocolateFormValues[K]) => void;
  onSave: () => void;
  onDelete?: () => void;
  saveLabel: string;
}

function mergeUniqueValues(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const group of groups) {
    for (const item of group) {
      const normalized = item.trim();
      if (!normalized) {
        continue;
      }

      const key = normalized.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      values.push(normalized);
    }
  }

  return values;
}

function appendCommaValue(currentValue: string, nextValue: string): string {
  const items = currentValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
    return currentValue;
  }

  return [...items, nextValue].join(", ");
}

function toChipOptions(values: string[]) {
  return values.map((value) => ({
    key: value,
    label: value,
  }));
}

export function ChocolateForm({ values, existingChocolates, onChange, onSave, onDelete, saveLabel }: ChocolateFormProps) {
  const [originPickerVisible, setOriginPickerVisible] = useState(false);
  const [isCacaoListed, setIsCacaoListed] = useState(values.cacaoPercent.trim().length > 0);

  useEffect(() => {
    setIsCacaoListed(values.cacaoPercent.trim().length > 0);
  }, [values.cacaoPercent]);

  const brandOptions = useMemo(
    () => mergeUniqueValues(existingChocolates.map((chocolate) => chocolate.brand)).slice(0, 6),
    [existingChocolates],
  );
  const categoryOptions = useMemo(
    () => mergeUniqueValues(commonChocolateCategories, existingChocolates.map((chocolate) => chocolate.category)),
    [existingChocolates],
  );
  const originOptions = useMemo(
    () => mergeUniqueValues(commonOriginCountries, existingChocolates.map((chocolate) => chocolate.originCountry)),
    [existingChocolates],
  );
  const quickOriginOptions = originOptions.slice(0, 6);

  function handleCacaoVisibilityChange(nextValue: "listed" | "not_listed") {
    setIsCacaoListed(nextValue === "listed");

    if (nextValue === "not_listed") {
      onChange("cacaoPercent", "");
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basics</Text>
        <FormField
          label="Brand"
          value={values.brand}
          onChangeText={(value) => onChange("brand", value)}
          helperText="Choose from your saved brands below or type a new one."
        />
        <ChoiceChipGroup options={toChipOptions(brandOptions)} selectedValue={values.brand} onSelect={(value) => onChange("brand", value)} />

        <FormField
          label="Product Name"
          value={values.productName}
          onChangeText={(value) => onChange("productName", value)}
          helperText="Use the packaging name so it matches what you actually bought."
        />

        <FormField
          label="Category"
          value={values.category}
          onChangeText={(value) => onChange("category", value)}
          helperText="Keep this broad so the library stays easy to scan."
        />
        <ChoiceChipGroup
          options={toChipOptions(categoryOptions)}
          selectedValue={values.category}
          onSelect={(value) => onChange("category", value)}
        />

        <SelectionField
          label="Origin Country"
          selectedLabel={values.originCountry || "Choose a country or leave blank"}
          options={originOptions.map((country) => ({
            id: country,
            label: country,
          }))}
          visible={originPickerVisible}
          onOpen={() => setOriginPickerVisible(true)}
          onClose={() => setOriginPickerVisible(false)}
          onSelect={(value) => {
            setOriginPickerVisible(false);
            onChange("originCountry", value ?? "");
          }}
          helperText="Optional. Some chocolate packages list bean origin, some do not."
        />
        <ChoiceChipGroup
          options={toChipOptions(quickOriginOptions)}
          selectedValue={values.originCountry}
          onSelect={(value) => onChange("originCountry", value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Package Details</Text>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Is cacao percentage listed on the package?</Text>
          <SegmentedControl
            value={isCacaoListed ? "listed" : "not_listed"}
            onChange={(value) => handleCacaoVisibilityChange(value)}
            options={[
              { key: "listed", label: "Listed" },
              { key: "not_listed", label: "Not Listed" },
            ]}
          />
        </View>

        {isCacaoListed ? (
          <>
            <FormField
              label="Cacao %"
              value={values.cacaoPercent}
              onChangeText={(value) => onChange("cacaoPercent", value)}
              keyboardType="decimal-pad"
              helperText="Use the number from the package. Leave it blank only if the label truly does not say."
            />
            <ChoiceChipGroup
              options={toChipOptions(commonCacaoPercents)}
              selectedValue={values.cacaoPercent}
              onSelect={(value) => onChange("cacaoPercent", value)}
            />
          </>
        ) : (
          <View style={styles.helperCard}>
            <Text style={styles.helperCardTitle}>No cacao percentage is okay</Text>
            <Text style={styles.helperCardText}>This form treats cacao percentage as optional, so the library still works when the package does not tell you.</Text>
          </View>
        )}

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
              helperText="Use a simple 1 to 5 score."
            />
          </View>
        </View>
        <ChoiceChipGroup
          options={toChipOptions(["1", "2", "3", "4", "5"])}
          selectedValue={values.rating}
          onSelect={(value) => onChange("rating", value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taste Memory</Text>
        <FormField
          label="Flavor Notes"
          value={values.flavorNotesText}
          onChangeText={(value) => onChange("flavorNotesText", value)}
          placeholder="berry, floral, roasted"
          helperText="Separate notes with commas."
        />
        <ChoiceChipGroup
          options={toChipOptions(commonFlavorNotes)}
          onSelect={(value) => onChange("flavorNotesText", appendCommaValue(values.flavorNotesText, value))}
        />

        <FormField
          label="Ingredients"
          value={values.ingredientsText}
          onChangeText={(value) => onChange("ingredientsText", value)}
          placeholder="cocoa mass, sugar"
          helperText="Separate ingredients with commas if you want to keep a clean reference."
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Keep or Rebuy</Text>
        <View style={styles.flagSection}>
          <Text style={styles.fieldLabel}>Favorite</Text>
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
          <Text style={styles.fieldLabel}>Buy Again</Text>
          <SegmentedControl
            value={values.buyAgain ? "yes" : "no"}
            onChange={(value) => onChange("buyAgain", value === "yes")}
            options={[
              { key: "yes", label: "Yes" },
              { key: "no", label: "No" },
            ]}
          />
        </View>
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
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.text,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  column: {
    flex: 1,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  flagSection: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
  },
  helperCard: {
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
    padding: spacing.md,
    gap: spacing.xs,
  },
  helperCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.text,
  },
  helperCardText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.textMuted,
  },
});
