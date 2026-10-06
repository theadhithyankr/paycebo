import { useAppTheme } from "../src/state/AppearanceProvider";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, BackHandler, Keyboard, Pressable, View } from "react-native";
import { GoalAvatar } from "../src/components/GoalAvatar";
import { OnboardingFrame } from "../src/components/OnboardingFrame";
import { Button, Display, ErrorNotice, Field, Icon, Notice, Txt } from "../src/components/ui";
import { money, parseMoney, progressFor, safeToSpend, savedFor, type Goal, type SavingsState } from "../src/lib/model";
import { freshDraft, stepError, type OnboardingDraft } from "../src/lib/onboarding";
import { onboardingDraftStore } from "../src/state/onboardingDraft";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";

const TITLES = ["What are you saving for?", "How much?", "Your bank balance?", "Start with a little?"] as const;
const SUGGESTIONS = [{ name: "Headphones", icon: "headphones" }, { name: "A trip", icon: "compass" }, { name: "Emergency fund", icon: "shield" }] as const;

function Choice({ label, selected, onPress, disabled = false }: { label: string; selected: boolean; onPress: () => void; disabled?: boolean }) {
  const { colors: palette } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}
    className={"min-h-[48px] px-4 py-3 rounded-2xl active:opacity-75 " + (selected ? "bg-accent" : "bg-elevated")}>
    <Txt style={{ color: selected ? "#102015" : palette.foreground, fontWeight: selected ? "600" : "400" }}>{label}</Txt>
  </Pressable>;
}
function parsed(input: string, zero = false) { try { return parseMoney(input, zero); } catch { return null; } }

export default function Setup() {
  const { colors: palette } = useAppTheme();
  const { startPersonal, hasPersonal } = useSavings();
  const focused = useIsFocused();
  const [draft, setDraft] = useState<OnboardingDraft>(freshDraft);
  const draftRef = useRef(draft);
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [draftProblem, setDraftProblem] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<SavingsState | null>(null);
  const [customGoal, setCustomGoal] = useState(false);
  const enabled = useRef(false);
  const dirty = useRef(false);
  const alive = useRef(true);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setLoadError(""); setDraftProblem(false);
    try {
      const personal = await hasPersonal();
      if (!alive.current) return;
      setExisting(personal);
      if (!personal) {
        try {
          const saved = await onboardingDraftStore.read();
          if (!alive.current) return;
          const restored = saved ?? freshDraft();
          draftRef.current = restored; setDraft(restored);
          setCustomGoal(Boolean(restored.name && !SUGGESTIONS.some((item) => item.name === restored.name)));
          enabled.current = true;
        } catch (err) { if (alive.current) { setDraftProblem(true); setLoadError(errorMessage(err)); } }
      }
    } catch (err) { if (alive.current) setLoadError(errorMessage(err)); }
    finally { if (alive.current) setLoading(false); }
  }, [hasPersonal]);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (!enabled.current || !dirty.current) return;
    const current = draftRef.current;
    try {
      await onboardingDraftStore.save(current);
      if (current === draftRef.current) dirty.current = false;
      if (alive.current) setStorageError("");
    } catch (err) { if (alive.current) setStorageError(errorMessage(err)); }
  }, []);

  useEffect(() => {
    alive.current = true; void load();
    const subscription = AppState.addEventListener("change", (status) => { if (status !== "active") void flush(); });
    return () => { alive.current = false; subscription.remove(); void flush(); };
  }, [load, flush]);
  useEffect(() => {
    if (!loading && enabled.current && dirty.current) timer.current = setTimeout(() => void flush(), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [draft, loading, flush]);

  function patch(change: Partial<OnboardingDraft>) {
    const next = { ...draftRef.current, ...change };
    draftRef.current = next; dirty.current = true; setDraft(next); setError("");
  }
  const leave = useCallback(() => {
    Keyboard.dismiss(); void flush();
    if (router.canGoBack()) router.back(); else router.replace("/");
  }, [flush]);
  const back = useCallback(() => {
    if (lock.current) return;
    Keyboard.dismiss();
    if (success) { router.replace("/(tabs)"); return; }
    if (!existing && !loading && !loadError && draftRef.current.step > 0) {
      const next = { ...draftRef.current, step: draftRef.current.step - 1 };
      draftRef.current = next; dirty.current = true; setDraft(next); setError(""); void flush();
    } else leave();
  }, [success, existing, loading, loadError, leave, flush]);
  useEffect(() => {
    if (!focused) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (Keyboard.isVisible()) { Keyboard.dismiss(); return true; }
      back(); return true;
    });
    return () => subscription.remove();
  }, [back, focused]);

  async function next() {
    if (lock.current) return;
    const message = stepError(draftRef.current, draftRef.current.step);
    if (message) { setError(message); return; }
    lock.current = true; setBusy(true); setError(""); Keyboard.dismiss();
    const nextDraft = { ...draftRef.current, step: draftRef.current.step + 1 };
    draftRef.current = nextDraft; dirty.current = true;
    // Reveal the next question after its draft write settles, so an immediate
    // restart cannot race the transition. A failed draft write still permits use.
    await flush();
    if (alive.current) { setDraft(nextDraft); setBusy(false); }
    lock.current = false;
  }
  async function restart() {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try { await onboardingDraftStore.clear(); await load(); }
    catch (err) { setLoadError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  async function finish(skip: boolean) {
    if (lock.current) return;
    if (!existing) {
      for (let step = 0; step <= (skip ? 2 : 3); step++) {
        const message = stepError(draftRef.current, step);
        if (message) { patch({ step }); setError(message); return; }
      }
    }
    lock.current = true; setBusy(true); setError(""); Keyboard.dismiss();
    if (timer.current) clearTimeout(timer.current);
    try {
      const value = draftRef.current;
      const committed = await startPersonal(existing ? 0 : parseMoney(value.balance, true),
        existing ? undefined : { name: value.name.trim(), targetPaise: parseMoney(value.target) },
        existing || skip ? undefined : parseMoney(value.allocation));
      enabled.current = false; dirty.current = false;
      if (existing) { router.replace("/(tabs)"); return; }
      setSuccess(committed);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      try { await onboardingDraftStore.clear(); setStorageError(""); }
      catch { setStorageError("Your savings are saved. The unfinished setup note couldn’t be cleared; it won’t reopen your onboarding."); }
    } catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }

  if (loading || loadError || existing) return <OnboardingFrame step={0} title={existing ? "Welcome back" : "Opening your setup"} onBack={back} busy={busy}
    footer={existing ? <Button label="Resume personal savings" loading={busy} onPress={() => void finish(true)} /> : loading ? <Txt className="text-muted">Picking up where you left off…</Txt> : <>
      <Button label="Try again" loading={busy} onPress={() => void load()} />
      {draftProblem ? <Button label="Restart unfinished setup" variant="ghost" disabled={busy} onPress={() => void restart()} /> : null}
    </>}>
    <Display style={{ fontSize: 34, lineHeight: 42 }}>{existing ? "Welcome back." : "A little intention goes a long way."}</Display>
    {loading ? <ActivityIndicator color={palette.accent} /> : existing ? <Txt className="text-muted">Your goals and savings are already here. Let’s pick up where you left off.</Txt> : <ErrorNotice message={loadError} />}
    <ErrorNotice message={error} />
  </OnboardingFrame>;

  const balance = parsed(draft.balance, true);
  const target = parsed(draft.target);
  const amount = parsed(draft.allocation);
  const maximum = Math.min(balance ?? 0, target ?? 0);
  const validAmount = amount !== null && amount <= maximum;
  const savedGoal = success?.goals[0];
  const saved = success && savedGoal ? savedFor(success, savedGoal.id) : 0;
  if (success && savedGoal) return <OnboardingFrame step={4} title="Ready to go" onBack={back}
    footer={<Button label="See my savings" icon="arrow-up-right" onPress={() => router.replace("/(tabs)")} />}>
    <View className="flex-1 items-center justify-center gap-5 py-8">
      <View style={{ width: 104, height: 104, alignItems: "center", justifyContent: "center" }}>
        <GoalAvatar goal={savedGoal} showProgress={false} size={96} accessibilityLabel={savedGoal.name + ", goal created"} />
        <View style={{ position: "absolute", right: 0, bottom: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: palette.accent, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: palette.background }}><Icon name="check" size={18} color="#102015" /></View>
      </View>
      <Txt style={{ color: palette.accentText, fontSize: 14 }}>Goal created</Txt>
      <Display style={{ fontSize: 30, lineHeight: 38, textAlign: "center" }}>{savedGoal.name}</Display>
      <Txt style={{ textAlign: "center", fontSize: 18 }}>{saved > 0 ? `${money(saved)} saved. Your first little win.` : "Ready to fund. At your pace."}</Txt>
    </View>
    {storageError ? <Notice>{storageError}</Notice> : null}
  </OnboardingFrame>;
  return <OnboardingFrame step={draft.step} title={TITLES[draft.step] ?? TITLES[0]} onBack={back} busy={busy}
    footer={<>
      <ErrorNotice message={error} />
      {draft.step === 3 && validAmount ? <Txt className="text-muted" style={{ textAlign: "center", fontSize: 13 }}>Safe to Spend after saving: {money((balance ?? 0) - amount)}</Txt> : null}
      {draft.step < 3 ? <Button label="Continue" loading={busy} onPress={() => void next()} /> : <>
        <Button label={maximum <= 0 ? "Create my goal" : validAmount ? `Reserve ${money(amount)}` : "Reserve my first saving"} loading={busy} onPress={() => void finish(maximum <= 0)} />
        {maximum > 0 ? <Button label="Save later" variant="ghost" disabled={busy} onPress={() => void finish(true)} /> : null}
      </>}
    </>}>
    <Display accessibilityRole="header" style={{ fontSize: 30, lineHeight: 38, marginBottom: 8 }}>{TITLES[draft.step]}</Display>
    {draft.step === 0 ? <View className="gap-3">
      {SUGGESTIONS.map((item) => <Pressable key={item.name} accessibilityRole="button" accessibilityLabel={item.name} disabled={busy} accessibilityState={{ selected: !customGoal && draft.name === item.name, disabled: busy }}
        onPress={() => { setCustomGoal(false); patch({ name: item.name }); }} className={"min-h-[64px] rounded-2xl px-5 py-4 flex-row items-center gap-4 border active:opacity-75 " + (!customGoal && draft.name === item.name ? "bg-contribution border-positive" : "bg-surface border-line")}>
        <Icon name={item.icon} color={palette.accentText} size={24} /><Txt className="flex-1 font-medium">{item.name}</Txt>
        {!customGoal && draft.name === item.name ? <Icon name="check" color={palette.accentText} /> : null}
      </Pressable>)}
      <Choice label="Something else" selected={customGoal} disabled={busy} onPress={() => { setCustomGoal(true); if (SUGGESTIONS.some((item) => item.name === draft.name)) patch({ name: "" }); }} />
      {customGoal ? <Field label="Your goal name" value={draft.name} editable={!busy} autoFocus onChangeText={(name) => patch({ name })} placeholder="e.g. My first guitar" maxLength={60} autoCapitalize="words" /> : null}
    </View> : null}
    {draft.step === 1 ? <View className="gap-4">
      <Field label="Goal target (₹)" value={draft.target} editable={!busy} onChangeText={(value) => patch({ target: value })} placeholder="e.g. 5000" keyboardType="decimal-pad" maxLength={12} style={{ fontSize: 32, lineHeight: 42 }} />
      <View className="flex-row flex-wrap gap-2">{[1000, 5000, 10000].map((value) => <Choice key={value} label={money(value * 100)} selected={target === value * 100} disabled={busy} onPress={() => patch({ target: String(value) })} />)}</View>
    </View> : null}
    {draft.step === 2 ? <View className="gap-3">
      <Field label="Current bank balance (₹)" value={draft.balance} editable={!busy} onChangeText={(value) => patch({ balance: value })} placeholder="Enter your balance" keyboardType="decimal-pad" maxLength={12} style={{ fontSize: 32, lineHeight: 42 }} />
      <Txt className="text-muted" style={{ fontSize: 13 }}>Entered manually. No bank connection.</Txt>
    </View> : null}
    {draft.step === 3 && maximum > 0 ? <View className="gap-4">
      <Field label="First saving (₹)" value={draft.allocation} onChangeText={(value) => patch({ allocation: value })} placeholder="Choose your amount" keyboardType="decimal-pad" maxLength={12} editable={!busy} style={{ fontSize: 32, lineHeight: 42 }} />
      <View className="flex-row flex-wrap gap-2">{[100, 500, 1000].filter((value) => value * 100 <= maximum).map((value) => <Choice key={value} label={money(value * 100)} selected={amount === value * 100} disabled={busy} onPress={() => patch({ allocation: String(value) })} />)}</View>
      <Txt className="text-muted" style={{ fontSize: 13 }}>Money stays in your bank.</Txt>
    </View> : draft.step === 3 ? <Txt className="text-muted">Your goal is ready. Save when you can.</Txt> : null}
    {storageError ? <View className="gap-2"><Notice>{storageError}</Notice><Button label="Retry saving my setup answers" variant="secondary" disabled={busy} onPress={() => void flush()} /></View> : null}
  </OnboardingFrame>;
}
