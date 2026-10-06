import { Redirect, Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, palette } from "../../src/components/ui";
import { View } from "react-native";
import { useSavings } from "../../src/state/SavingsProvider";

export default function TabsLayout() {
  const { state } = useSavings();
  const insets = useSafeAreaInsets();
  if (!state) return <Redirect href="/" />;
  return <Tabs screenOptions={{
    headerShown: false, tabBarActiveTintColor: palette.dark, tabBarInactiveTintColor: palette.muted,
    tabBarStyle: { backgroundColor: palette.background, borderTopColor: palette.line, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12), height: 76 + Math.max(insets.bottom, 12) },
    tabBarIconStyle: { height: 40, width: 40 }, tabBarLabelStyle: { fontSize: 12, lineHeight: 18, marginTop: 0 }, sceneStyle: { backgroundColor: palette.background },
  }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarAccessibilityLabel: "Home", tabBarIcon: ({ color, focused }) => <View style={{ borderRadius: 20, padding: 8, backgroundColor: focused ? palette.dark : "transparent" }}><Icon name="home" color={focused ? palette.onDark : color} /></View> }} />
    <Tabs.Screen name="activity" options={{ title: "Activity", tabBarAccessibilityLabel: "Activity", tabBarIcon: ({ color, focused }) => <View style={{ borderRadius: 20, padding: 8, backgroundColor: focused ? palette.dark : "transparent" }}><Icon name="bar-chart-2" color={focused ? palette.onDark : color} /></View> }} />
    <Tabs.Screen name="settings" options={{ title: "Settings", tabBarAccessibilityLabel: "Settings", tabBarIcon: ({ color, focused }) => <View style={{ borderRadius: 20, padding: 8, backgroundColor: focused ? palette.dark : "transparent" }}><Icon name="sliders" color={focused ? palette.onDark : color} /></View> }} />
  </Tabs>;
}
