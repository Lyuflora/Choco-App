// Library stores reusable chocolate details so daily logging stays fast and favorite bars are easy to pick again.
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { ListItemCard } from "../../src/components/ui/ListItemCard";
import { PrimaryButton } from "../../src/components/ui/PrimaryButton";
import { ScreenShell } from "../../src/components/ui/ScreenShell";
import { useDarkDiary } from "../../src/store/app-provider";
import { palette, radii, spacing } from "../../src/ui/theme";

export default function LibraryScreen() {
  const router = useRouter();
  const { store, isHydrating, toggleFavorite, toggleBuyAgain } = useDarkDiary();

  if (isHydrating) {
    return (
      <ScreenShell title="Library" subtitle="Loading saved chocolates...">
        <EmptyState title="Hydrating library" description="Saved chocolates are loading from local storage." />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Library" subtitle="Your saved bars, favorites, and re-buy list.">
      <PrimaryButton label="Add New Chocolate" onPress={() => router.push("/chocolate/new")} />

      {store.chocolates.length === 0 ? (
        <EmptyState
          title="No chocolates yet"
          description="Add your first bar to build a reusable library for purchases, tastings, and daily logs."
        />
      ) : (
        <View style={styles.list}>
          {store.chocolates.map((chocolate) => (
            <View key={chocolate.id} style={styles.itemBlock}>
              <ListItemCard
                title={`${chocolate.brand} ${chocolate.productName}`}
                subtitle={`${chocolate.category} / ${chocolate.originCountry || "Origin unknown"} / ${
                  chocolate.cacaoPercent ?? "?"
                }% cacao`}
                meta={chocolate.rating ? `${chocolate.rating}/5` : "Unrated"}
                badges={[
                  chocolate.favorite ? "Favorite" : "Not favorite",
                  chocolate.buyAgain ? "Buy again" : "Maybe once",
                ]}
                onPress={() => router.push(`/chocolate/${chocolate.id}`)}
              />

              <View style={styles.actions}>
                <Pressable style={styles.actionChip} onPress={() => toggleFavorite(chocolate.id)}>
                  <Text style={styles.actionText}>{chocolate.favorite ? "Unfavorite" : "Favorite"}</Text>
                </Pressable>
                <Pressable style={styles.actionChip} onPress={() => toggleBuyAgain(chocolate.id)}>
                  <Text style={styles.actionText}>{chocolate.buyAgain ? "Skip rebuy" : "Buy again"}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  itemBlock: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionChip: {
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.chocolate,
  },
});
