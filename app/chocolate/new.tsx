import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useState } from "react";
import { ChocolateForm, type ChocolateFormValues } from "../../src/components/library/ChocolateForm";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { createEmptyChocolateDraft, useDarkDiary } from "../../src/store/app-provider";
import { parseOptionalNumber } from "../../src/utils/validation";

function initialValues(): ChocolateFormValues {
  const draft = createEmptyChocolateDraft();
  return {
    brand: draft.brand,
    productName: draft.productName,
    category: draft.category,
    cacaoPercent: "",
    originCountry: draft.originCountry,
    flavorNotesText: draft.flavorNotesText,
    ingredientsText: draft.ingredientsText,
    packageSizeGrams: "",
    defaultCalories: "",
    defaultPrice: "",
    rating: "",
    favorite: draft.favorite,
    buyAgain: draft.buyAgain,
  };
}

export default function NewChocolateScreen() {
  const router = useRouter();
  const { saveChocolate } = useDarkDiary();
  const [values, setValues] = useState<ChocolateFormValues>(initialValues);

  function updateField<K extends keyof ChocolateFormValues>(field: K, value: ChocolateFormValues[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    try {
      await saveChocolate({
        brand: values.brand,
        productName: values.productName,
        category: values.category,
        cacaoPercent: parseOptionalNumber(values.cacaoPercent),
        originCountry: values.originCountry,
        flavorNotesText: values.flavorNotesText,
        ingredientsText: values.ingredientsText,
        packageSizeGrams: parseOptionalNumber(values.packageSizeGrams),
        defaultCalories: parseOptionalNumber(values.defaultCalories),
        defaultPrice: parseOptionalNumber(values.defaultPrice),
        rating: parseOptionalNumber(values.rating),
        favorite: values.favorite,
        buyAgain: values.buyAgain,
      });
      router.replace("/(tabs)/library");
    } catch (error) {
      Alert.alert("Could not save chocolate", error instanceof Error ? error.message : "Try again.");
    }
  }

  return (
    <ScreenShell title="New Chocolate" subtitle="Add a reusable chocolate entry for future logs.">
      <ChocolateForm values={values} onChange={updateField} onSave={handleSave} saveLabel="Save Chocolate" />
    </ScreenShell>
  );
}

