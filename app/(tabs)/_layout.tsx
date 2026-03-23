// Tab layout defines the five primary areas of the app and keeps navigation simple for a first MVP.
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { palette, radii } from "../../src/ui/theme";

interface TabMarkerProps {
  label: string;
  color: string;
}

function TabMarker({ label, color }: TabMarkerProps) {
  return (
    <View style={[styles.marker, { borderColor: color }]}>
      <Text style={[styles.markerText, { color }]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: palette.chocolate,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => <TabMarker label="T" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => <TabMarker label="C" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => <TabMarker label="I" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <TabMarker label="L" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabMarker label="S" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
