// Edit chocolate updates or removes a saved library item while reusing the same form as the create flow.
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { useEffect, useState } from "react";
import { ChocolateForm, type ChocolateFormValues } from "../../src/components/library/ChocolateForm";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { PrimaryButton } from "../../src/components/ui/PrimaryButton";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { createEmptyChocolateDraft, toChocolateDraft, useDarkDiary } from "../../src/store/app-provider";
import { parseOptionalNumber } from "../../src/utils/validation";

function emptyValues(): ChocolateFormValues {
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

export default function EditChocolateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { getChocolate, saveChocolate, deleteChocolate } = useDarkDiary();
  const chocolate = getChocolate(params.id);
  const [values, setValues] = useState<ChocolateFormValues>(emptyValues);

  useEffect(() => {
    if (!chocolate) {
      return;
    }

    const draft = toChocolateDraft(chocolate);
    setValues({
      brand: draft.brand,
      productName: draft.productName,
      category: draft.category,
      cacaoPercent: draft.cacaoPercent === null ? "" : `${draft.cacaoPercent}`,
      originCountry: draft.originCountry,
      flavorNotesText: draft.flavorNotesText,
      ingredientsText: draft.ingredientsText,
      packageSizeGrams: draft.packageSizeGrams === null ? "" : `${draft.packageSizeGrams}`,
      defaultCalories: draft.defaultCalories === null ? "" : `${draft.defaultCalories}`,
      defaultPrice: draft.defaultPrice === null ? "" : `${draft.defaultPrice}`,
      rating: draft.rating === null ? "" : `${draft.rating}`,
      favorite: draft.favorite,
      buyAgain: draft.buyAgain,
    });
  }, [chocolate]);

  function updateField<K extends keyof ChocolateFormValues>(field: K, value: ChocolateFormValues[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (!params.id) {
      return;
    }

    try {
      await saveChocolate(
        {
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
        },
        params.id,
      );
      router.replace("/(tabs)/library");
    } catch (error) {
      Alert.alert("Could not save chocolate", error instanceof Error ? error.message : "Try again.");
    }
  }

  async function handleDelete() {
    if (!params.id) {
      return;
    }

    const shouldDelete = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Delete chocolate?",
        "Existing entries will keep their notes but lose the chocolate link.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => resolve(false),
        },
      );
    });

    if (!shouldDelete) {
      return;
    }

    await deleteChocolate(params.id);
    router.replace("/(tabs)/library");
  }

  if (!chocolate) {
    return (
      <ScreenShell title="Edit Chocolate" subtitle="This chocolate could not be found.">
        <EmptyState title="Missing chocolate" description="The item may have been deleted or the link is outdated." />
        <PrimaryButton label="Back to Library" onPress={() => router.replace("/(tabs)/library")} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Edit Chocolate" subtitle={`${chocolate.brand} ${chocolate.productName}`}>
      <ChocolateForm values={values} onChange={updateField} onSave={handleSave} onDelete={handleDelete} saveLabel="Save Changes" />
    </ScreenShell>
  );
}
