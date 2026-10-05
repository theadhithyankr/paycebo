import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { Button, DemoBanner, Display, ErrorNotice, Icon, Notice, Page, palette, Txt } from "../../src/components/ui";
import { money } from "../../src/lib/model";
import { errorMessage, useSavings } from "../../src/state/SavingsProvider";

export default function Settings() {
  const { state, mode, update, startDemo, startPersonal, hasPersonal } = useSavings();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  if (!state) return null;
  async function perform(action: () => Promise<unknown>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await action(); } catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Page>
    <Display className="pt-6 pb-2" style={{ fontSize: 32 }}>Make it yours.</Display>
    <Txt className="text-muted mb-6">A little personality. Your rules.</Txt>
    <DemoBanner />
    <View className="gap-6">
      <Pressable accessibilityRole="button" accessibilityLabel="Update bank balance" onPress={() => router.push("/balance")} className="flex-row gap-3 items-center py-4 border-b border-line">
        <Icon name="credit-card" color={palette.accent} />
        <View className="flex-1"><Txt className="font-medium">Bank balance</Txt><Txt className="text-muted" style={{ fontSize: 14 }}>{money(state.bankBalancePaise)} · entered manually</Txt></View><Icon name="chevron-right" color={palette.muted} />
      </Pressable>
      <View className="gap-3">
        <View className="flex-row items-center gap-4">
          <View className="flex-1"><Txt className="font-medium">Keep it playful</Txt><Txt className="text-muted" style={{ fontSize: 14, lineHeight: 21 }}>Your goals can tease you a little.</Txt></View>
          <Switch accessibilityLabel="Playful goal messages" value={state.tone === "playful"} disabled={busy}
            trackColor={{ false: palette.line, true: palette.accent }} thumbColor={palette.foreground}
            onValueChange={(enabled) => void perform(() => update((current) => ({ ...current, tone: enabled ? "playful" : "supportive" })))} />
        </View>
        <Txt className="text-muted" style={{ fontSize: 14, lineHeight: 21 }}>{state.tone === "playful" ? "“The Headset is disappointed. Your money, your call.”" : "“It’s okay to adjust your plans.”"}{"\n"}This changes new reminders and withdrawal confirmations.</Txt>
      </View>
      <ErrorNotice message={error} />
      <View className="h-px bg-line" />
      <View className="gap-3">
        <Display style={{ fontSize: 24, lineHeight: 31 }}>{mode === "demo" ? "Ready for the real you?" : "Take a look around"}</Display>
        <Txt className="text-muted">{mode === "demo" ? "Your demo and personal savings are kept separately." : "Explore sample goals without changing your personal savings."}</Txt>
        <Button label={mode === "demo" ? "Open personal savings" : "Explore the demo"} variant="secondary" loading={busy}
          onPress={() => void perform(async () => {
            if (mode === "demo") {
              if (await hasPersonal()) { await startPersonal(0); router.replace("/(tabs)"); }
              else router.push("/setup");
            } else { await startDemo(); router.replace("/(tabs)"); }
          })} />
      </View>
      <Notice>Paycebo stores your savings on this device. Uninstalling the app or clearing its storage removes this data. There’s no cloud backup in this version.</Notice>
      <View className="py-3 gap-1"><Txt className="font-medium">Paycebo 1.0</Txt><Txt className="text-muted" style={{ fontSize: 13 }}>Pay your future self.</Txt></View>
    </View>
  </Page>;
}
