import { Pressable, StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "../../ui/theme";

interface ListItemCardProps {
  title: string;
  subtitle: string;
  meta?: string;
  badges?: string[];
  onPress?: () => void;
}

export function ListItemCard({ title, subtitle, meta, badges = [], onPress }: ListItemCardProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {badges.length ? (
        <View style={styles.badges}>
          {badges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: palette.text,
  },
  subtitle: {
    fontSize: 13,
    color: palette.textMuted,
    lineHeight: 18,
  },
  meta: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.chocolateSoft,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.chocolate,
  },
});

