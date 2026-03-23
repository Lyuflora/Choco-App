// Root Expo Router layout. It wires up global providers and the shared stack used by tabs plus library edit screens.
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DarkDiaryProvider } from "../src/store/app-provider";
import { palette } from "../src/ui/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
