import { useFundingHints } from "../../src/state/FundingHintsProvider";
import { useAppTheme } from "../../src/state/AppearanceProvider";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { Button, DemoBanner, Display, ErrorNotice, Icon, Notice, Page, Txt } from "../../src/components/ui";
import { money } from "../../src/lib/model";
import { errorMessage, useSavings } from "../../src/state/SavingsProvider";

export default function Settings() {
  const { colors: palette } = useAppTheme();
  const appearance = useAppTheme();
  const hints = useFundingHints();
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
  return <Page dock>
    <Display className="pt-6 pb-2" style={{ fontSize: 32 }}>Make it yours.</Display>
    <Txt className="text-muted mb-6">A little personality. Your rules.</Txt>
    <DemoBanner />
    <View className="gap-6">
      <View className="gap-3">
        <Display style={{ fontSize: 24 }}>Appearance</Display>
        <View className="flex-row gap-2" accessibilityRole="radiogroup" accessibilityLabel="Appearance">{(["system", "dark", "light"] as const).map((choice) => <Pressable key={choice} accessibilityRole="radio" accessibilityLabel={choice.charAt(0).toUpperCase() + choice.slice(1) + " appearance"}
          aria-checked={appearance.preference === choice} accessibilityState={{ checked: appearance.preference === choice, disabled: appearance.busy }} disabled={appearance.busy} onPress={() => void appearance.setPreference(choice)}
          style={{ flex: 1, minHeight: 48, padding: 12, borderRadius: 16, backgroundColor: appearance.preference === choice ? palette.accent : palette.elevated }}>
          <Txt style={{ textAlign: "center", color: appearance.preference === choice ? "#102015" : palette.foreground }}>{choice.charAt(0).toUpperCase() + choice.slice(1)}</Txt>
        </Pressable>)}</View>
        <ErrorNotice message={appearance.error} />
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Home screen widgets" onPress={() => router.push("/widgets")} className="flex-row items-center gap-3 min-h-[56px] py-3 border-b border-line">
        <Icon name="grid" color={palette.accentText} /><View className="flex-1"><Txt className="font-medium">Home screen widgets</Txt><Txt className="text-muted" style={{ fontSize: 13 }}>Balances, goals, and everyday allowances</Txt></View><Icon name="chevron-right" color={palette.muted} />
      </Pressable>
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
      <View className="gap-3">
        <View className="flex-row items-center gap-4"><View className="flex-1"><Txt className="font-medium">Show funding explanations</Txt><Txt className="text-muted" style={{ fontSize: 14 }}>See a worked example before updating your balance to save.</Txt></View>
          <Switch accessibilityLabel="Show funding explanations" value={hints.enabled} disabled={hints.busy || !hints.ready} onValueChange={value => void hints.setEnabled(value)} trackColor={{ false: palette.line, true: palette.accent }} thumbColor={palette.foreground} />
        </View><ErrorNotice message={hints.error} />
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
