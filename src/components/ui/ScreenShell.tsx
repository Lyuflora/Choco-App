// ScreenShell keeps page spacing, headers, and safe-area padding consistent so each screen can stay focused on its own content.
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette, spacing } from "../../ui/theme";

interface ScreenShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function ScreenShell({ title, subtitle, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.kicker}>Dark Diary</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 40,
  },
  header: {
    gap: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.chocolateSoft,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: palette.text,
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textMuted,
  },
});
