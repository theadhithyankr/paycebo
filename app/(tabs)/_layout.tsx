import { Redirect, Tabs } from "expo-router";
import React from "react";
import { FloatingTabBar } from "../../src/components/FloatingTabBar";
import { useAppTheme } from "../../src/state/AppearanceProvider";
import { useSavings } from "../../src/state/SavingsProvider";

export default function TabsLayout() {
  const { state } = useSavings(); const { colors } = useAppTheme();
  if (!state) return <Redirect href="/" />;
  return <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background }, tabBarStyle: { position: "absolute" } }}>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="activity" options={{ title: "Activity" }} />
    <Tabs.Screen name="settings" options={{ title: "Settings" }} />
  </Tabs>;
}
