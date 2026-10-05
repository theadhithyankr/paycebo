import { Redirect, router } from "expo-router";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Display, ErrorNotice, Mark, Page, palette, Txt } from "../src/components/ui";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";

export default function Welcome() {
  const { state, startDemo } = useSavings();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  if (state) return <Redirect href="/(tabs)" />;
  async function demo() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await startDemo(); router.replace("/(tabs)"); }
    catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Page>
    <View className="flex-row items-center gap-2 pt-6"><Mark /><Txt style={{ fontSize: 24, fontWeight: "600", letterSpacing: -0.8 }}>paycebo</Txt></View>
    <View className="flex-1 justify-center py-12 gap-8">
      <LinearGradient colors={["#17120F", "#352117", "#503122"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 28, padding: 28, gap: 24 }}>
        <View className="self-start bg-[#F5F2EC] rounded-2xl p-3"><Mark size={36} color="#583A26" /></View>
        <Display style={{ fontSize: 44, lineHeight: 51 }}>Pay your{"\n"}future self.</Display>
        <Txt style={{ color: "#E4CCB9", fontSize: 17, lineHeight: 26 }}>The headphones. The open road. A little peace of mind. Give your money somewhere to go.</Txt>
        <View className="flex-row items-center gap-2"><View className="w-2 h-2 rounded-full bg-accent" /><Txt style={{ color: "#E4CCB9", fontSize: 13 }}>Your goals are your new favorite contacts.</Txt></View>
      </LinearGradient>
      <View className="gap-3">
        <Button label="Start saving" icon="arrow-up-right" disabled={busy} onPress={() => router.push("/setup")} />
        <Button label="Explore the demo" variant="secondary" loading={busy} onPress={() => void demo()} />
        <ErrorNotice message={error} />
      </View>
    </View>
    <Txt className="text-muted pb-6" style={{ textAlign: "center", fontSize: 13, lineHeight: 20 }}>A savings tracker, with a little personality.{"\n"}Your money stays in your bank. Your data stays here.</Txt>
  </Page>;
}
