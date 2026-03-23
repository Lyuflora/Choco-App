import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DarkDiaryProvider } from "../src/store/app-provider";
import { palette } from "../src/ui/theme";

export default function RootLayout() {
  return (
    <DarkDiaryProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerShadowVisible: false,
          headerTintColor: palette.text,
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chocolate/new" options={{ title: "New Chocolate" }} />
        <Stack.Screen name="chocolate/[id]" options={{ title: "Edit Chocolate" }} />
      </Stack>
    </DarkDiaryProvider>
  );
}

