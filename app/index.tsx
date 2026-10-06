import { useAppTheme } from "../src/state/AppearanceProvider";
import { Redirect, router, useFocusEffect } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Display, ErrorNotice, Icon, Mark, Page, Txt } from "../src/components/ui";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";
import { onboardingDraftStore } from "../src/state/onboardingDraft";

export default function Welcome() {
  const { colors: palette } = useAppTheme();
  const { state, startDemo } = useSavings();
  const focused = useIsFocused();
  const [resuming, setResuming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    void onboardingDraftStore.read().then((draft) => { if (active) setResuming(Boolean(draft)); })
      .catch(() => { if (active) setResuming(true); });
    return () => { active = false; };
  }, []));
  if (state && focused) return <Redirect href="/(tabs)" />;
  async function demo() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await startDemo(); router.replace("/(tabs)"); }
    catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Page dark>
    <View className="flex-row items-center gap-2 pt-5"><Mark /><Txt style={{ fontSize: 24, fontWeight: "700", color: palette.onDark }}>paycebo</Txt></View>
    <View className="flex-1 justify-center gap-8 py-8">
      <LinearGradient colors={["#284E33", "#0B1711"]} style={{ minHeight: 220, borderRadius: 28, justifyContent: "center", alignItems: "center", padding: 28 }}>
        <View style={{ width: "100%", maxWidth: 280, padding: 24, borderRadius: 24, backgroundColor: palette.accent, gap: 20, transform: [{ rotate: "-6deg" }] }}>
          <View className="flex-row items-center justify-between"><Icon name="headphones" color={palette.dark} size={32} /><Txt style={{ color: palette.dark, fontSize: 12 }}>Example goal</Txt></View>
          <View><Txt style={{ color: palette.dark, fontSize: 14 }}>Headphones</Txt><Display style={{ color: palette.dark, fontSize: 32 }}>{"\u20b9"}5,000</Display></View>
          <View style={{ height: 6, borderRadius: 6, backgroundColor: "#10201525" }} />
        </View>
      </LinearGradient>
      <View className="gap-3"><Display style={{ fontSize: 38, lineHeight: 46, color: palette.onDark }}>For today.{"\n"}For future you.</Display><Txt style={{ color: palette.darkMuted, fontSize: 16 }}>Give your money a plan.</Txt></View>
      <View className="gap-2">
        <Button label={resuming ? "Continue your setup" : "Let’s start"} icon="arrow-up-right" disabled={busy} onPress={() => router.push("/setup")} />
        <Button label="Explore the demo" variant="ghost" dark loading={busy} onPress={() => void demo()} />
        <ErrorNotice message={error} />
      </View>
    </View>
    <Txt style={{ color: palette.darkMuted, textAlign: "center", fontSize: 13 }}>No bank connection. Your money stays in your bank.</Txt>
  </Page>;
}
