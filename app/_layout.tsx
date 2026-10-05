import "../global.css";
import { Aleo_400Regular, Aleo_700Bold } from "@expo-google-fonts/aleo";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ErrorNotice, FontContext, Notice, palette, Txt } from "../src/components/ui";
import { SavingsProvider, useSavings } from "../src/state/SavingsProvider";

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: palette.background, card: palette.background, text: palette.foreground, primary: palette.accent, border: palette.line } };

function Navigation() {
  const { ready, state, loadError, retry } = useSavings();
  useEffect(() => { if (ready && !state && !loadError) router.replace("/"); }, [ready, state, loadError]);
  if (!ready) return <View className="flex-1 items-center justify-center bg-background gap-4"><ActivityIndicator color={palette.accent} /><Txt>Opening Paycebo…</Txt></View>;
  if (loadError) return <View className="flex-1 bg-background justify-center px-6 gap-5">
    <ErrorNotice message={loadError} />
    <Notice>Your saved data is still on this device. Retrying won’t reset it or replace it with demo data.</Notice>
    <Button label="Try again" onPress={() => void retry()} />
  </View>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background }, gestureEnabled: true }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="goal/[id]" />
    <Stack.Screen name="setup" options={{ presentation: "modal" }} />
    <Stack.Screen name="goal-form" options={{ presentation: "modal" }} />
    <Stack.Screen name="balance" options={{ presentation: "modal" }} />
    <Stack.Screen name="payment" options={{ presentation: "modal" }} />
  </Stack>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Aleo_400Regular, Aleo_700Bold });
  return <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
    <SafeAreaProvider><ThemeProvider value={theme}><FontContext.Provider value={fontsLoaded}>
      <SavingsProvider><StatusBar style="light" />
        <View className="flex-1 w-full self-center" style={{ maxWidth: 640 }}>
          {!fontsLoaded && !fontError ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={palette.accent} /></View> : <Navigation />}
        </View>
      </SavingsProvider>
    </FontContext.Provider></ThemeProvider></SafeAreaProvider>
  </GestureHandlerRootView>;
}
