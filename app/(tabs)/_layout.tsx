import { Redirect, Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, palette } from "../../src/components/ui";
import { useSavings } from "../../src/state/SavingsProvider";

export default function TabsLayout() {
  const { state } = useSavings();
  const insets = useSafeAreaInsets();
  if (!state) return <Redirect href="/" />;
  return <Tabs screenOptions={{
    headerShown: false, tabBarActiveTintColor: palette.accent, tabBarInactiveTintColor: palette.muted,
    tabBarStyle: { backgroundColor: palette.background, borderTopColor: palette.line, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12), height: 64 + Math.max(insets.bottom, 12) },
    tabBarLabelStyle: { fontSize: 12, marginTop: 4 }, sceneStyle: { backgroundColor: palette.background },
  }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }} />
    <Tabs.Screen name="activity" options={{ title: "Activity", tabBarIcon: ({ color }) => <Icon name="clock" color={color} /> }} />
    <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <Icon name="sliders" color={color} /> }} />
  </Tabs>;
}
