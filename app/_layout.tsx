import "../global.css";
/* THESIS: Personal money plans as contacts, with one clear action per screen.
 * OWN-WORLD: User-approved dark green headers, light panels, Manrope, green controls.
 * STORY: Reserve for the future; give everyday expenses their own allowance.
 * FIRST VIEWPORT: Safe to Spend over a dark balance header, quick actions, then light contact lists.
 * FORM: Reference-pinned mixed finance interface; design seed f7815d43.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
 */
import { Manrope_400Regular, Manrope_700Bold } from "@expo-google-fonts/manrope";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button, ErrorNotice, FontContext, Notice, palette, Txt } from "../src/components/ui";
import { SavingsProvider, useSavings } from "../src/state/SavingsProvider";
import { onboardingDraftStore } from "../src/state/onboardingDraft";
import { GluestackUIProvider } from "../src/components/primitives";

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: palette.background, card: palette.background, text: palette.foreground, primary: palette.accent, border: palette.line } };

function Navigation() {
  const { ready, state, loadError, retry } = useSavings();
  useEffect(() => {
    let active = true;
    if (ready && !state && !loadError) {
      void onboardingDraftStore.read().then((draft) => { if (active) router.replace(draft ? "/setup" : "/"); })
        .catch(() => { if (active) router.replace("/"); });
    }
    return () => { active = false; };
  }, [ready, state, loadError]);
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
    <Stack.Screen name="setup" />
    <Stack.Screen name="allowance/[id]" />
    <Stack.Screen name="allowance-form" options={{ presentation: "modal" }} />
    <Stack.Screen name="expense" options={{ presentation: "modal" }} />
    <Stack.Screen name="goal-form" options={{ presentation: "modal" }} />
    <Stack.Screen name="balance" options={{ presentation: "modal" }} />
    <Stack.Screen name="payment" options={{ presentation: "modal" }} />
  </Stack>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Manrope_400Regular, Manrope_700Bold });
  return <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
    <SafeAreaProvider><ThemeProvider value={theme}><FontContext.Provider value={fontsLoaded}>
      <SavingsProvider><StatusBar style="dark" />
        <View nativeID="paycebo-f7815d43" className="flex-1 w-full self-center" style={{ maxWidth: 640 }}>
          <GluestackUIProvider>{!fontsLoaded && !fontError ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={palette.accent} /></View> : <Navigation />}</GluestackUIProvider>
        </View>
      </SavingsProvider>
    </FontContext.Provider></ThemeProvider></SafeAreaProvider>
  </GestureHandlerRootView>;
}
