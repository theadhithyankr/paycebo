import { FundingChangedError, fundGoal, previewGoalFunding, type FundingAction, type FundingPreview } from "../src/lib/goal-funding";
import { useFundingHints } from "../src/state/FundingHintsProvider";
import { useAppTheme } from "../src/state/AppearanceProvider";
import * as Haptics from "expo-haptics";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Keyboard, Pressable, Switch, View } from "react-native";
import { GoalAvatar } from "../src/components/GoalAvatar";
import { Button, ConfirmDialog, DemoBanner, Display, Empty, ErrorNotice, Field, FormPage, Icon, Notice, Txt } from "../src/components/ui";
import { addTransaction, money, parseMoney, progressFor, safeToSpend, savedFor, withdrawalCopy } from "../src/lib/model";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";

export default function Payment() {
  const { colors: palette } = useAppTheme();
  const { id, kind } = useLocalSearchParams<{ id: string; kind: string }>();
  const { state, update, now } = useSavings();
  const hints = useFundingHints();
  const [funding, setFunding] = useState<FundingPreview | null>(null);
  const [fundedResult, setFundedResult] = useState<{ bank: number; available: number } | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmAmount, setConfirmAmount] = useState<number | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  const lock = useRef(false);
  if (!state) return <Redirect href="/" />;
  const goal = state.goals.find((item) => item.id === id);
  if (!goal || (kind !== "contribution" && kind !== "withdrawal")) return <FormPage title="Payment unavailable"><Empty title="Choose a goal first" description="Return home and open a goal conversation." action={<Button label="Go home" onPress={() => router.replace("/(tabs)")} />} /></FormPage>;
  const paid = kind === "contribution";
  const maxAmount = paid ? Math.max(0, Math.min(safeToSpend(state, now), goal.targetPaise - savedFor(state, goal.id))) : savedFor(state, goal.id);
  async function commit(value: number) {
    if (lock.current || !goal) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await update((current) => addTransaction(current, goal.id, paid ? "contribution" : "withdrawal", value, note));
      setConfirmAmount(null); setSuccess(value);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) { setConfirmAmount(null); setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  async function resolveFunding(action: FundingAction) {
    if (lock.current || !funding) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const committed = await update(current => fundGoal(current, funding, action, note));
      setFundedResult({ bank: committed.bankBalancePaise, available: safeToSpend(committed) });
      setFunding(null); setSuccess(funding.amount);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      if (err instanceof FundingChangedError) setFunding(err.preview.shortfall > 0 ? err.preview : null);
      setError(errorMessage(err));
    } finally { lock.current = false; setBusy(false); }
  }
  function submit() {
    if (lock.current || !state || !goal) return;
    setError("");
    try {
      const value = parseMoney(amount);
      if (paid) {
        const preview = previewGoalFunding(state, goal.id, value, note, now);
        if (preview.shortfall > 0) { Keyboard.dismiss(); setFunding(preview); return; }
      }
      // Validate before prompting; commit repeats validation against the latest queued snapshot.
      addTransaction(state, goal.id, paid ? "contribution" : "withdrawal", value, note);
      if (paid) void commit(value);
      else setConfirmAmount(value);
    } catch (err) { setError(errorMessage(err)); }
  }
  if (success !== null) return <FormPage title={paid ? "A little win." : "Room to breathe."}>
    <DemoBanner />
    <View className="items-center py-10 gap-5" accessibilityLiveRegion="polite">
      <View className="h-20 w-20 rounded-full items-center justify-center bg-contribution"><Icon name="check" size={36} color={palette.positive} /></View>
      <Display style={{ fontSize: 40, lineHeight: 50 }}>{money(success)}</Display>
      <Txt style={{ textAlign: "center" }}>{paid ? "Saved for " : "Requested back from "}{goal.name}.</Txt>
      {note.trim() ? <Txt className="text-muted" style={{ textAlign: "center" }}>“{note.trim()}”</Txt> : null}
      <Txt className="text-muted" style={{ textAlign: "center" }}>{paid ? "Future you will remember this one." : "Your money. Your pace. Your call."}</Txt>
    </View>
    <Notice>{fundedResult ? `Tracked bank balance updated to ${money(fundedResult.bank)}. Safe to Spend: ${money(fundedResult.available)}. No real money was transferred.` : "Recorded on this device. Your bank balance hasn’t changed."}</Notice>
    <Button label="Back to my goal" onPress={() => router.back()} />
  </FormPage>;
  return <FormPage title={paid ? "Pay your goal" : "Request Money"} busy={busy} footer={<><ErrorNotice message={error} /><Button label={paid ? "Pay " + goal.name : "Request Money"} icon={paid ? "arrow-up-right" : "arrow-down-left"} variant={paid ? "primary" : "secondary"} loading={busy} disabled={paid ? goal.targetPaise <= savedFor(state, goal.id) : maxAmount <= 0} onPress={submit} /></>}>
    <DemoBanner />
    <View className="items-center gap-3"><GoalAvatar goal={goal} progress={progressFor(state, goal)} size={80} /><Display style={{ fontSize: 25, textAlign: "center" }}>{goal.name}</Display><Txt className="text-muted" style={{ fontSize: 14 }}>{paid ? "Available to save" : "Available to request"}: {money(maxAmount)}</Txt></View>
    <Field label="Amount (₹)" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="decimal-pad" maxLength={12} editable={!busy} style={{ fontSize: 36, lineHeight: 46, paddingVertical: 20, fontVariant: ["tabular-nums"] }} />
    <View className="flex-row flex-wrap gap-2">
      {[100, 500, 1000].filter((value) => value * 100 <= maxAmount).map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={"Use " + money(value * 100)} disabled={busy}
        className="min-h-[48px] px-4 justify-center rounded-full bg-elevated" onPress={() => setAmount(String(value))}><Txt style={{ fontSize: 14 }}>{money(value * 100)}</Txt></Pressable>)}
      {maxAmount > 0 ? <Pressable accessibilityRole="button" disabled={busy} className="min-h-[48px] px-4 justify-center rounded-full bg-elevated" onPress={() => setAmount((maxAmount / 100).toFixed(2))}><Txt className="text-positive" style={{ fontSize: 14 }}>{paid ? "Remaining" : "All saved"}</Txt></Pressable> : null}
    </View>
    <Field label={paid ? "What’s the little win? (optional)" : "Add a note (optional)"} value={note} onChangeText={setNote} placeholder={paid ? "Skipped ordering pizza" : "Needed a little breathing room"} maxLength={200} multiline editable={!busy} style={{ minHeight: 96, textAlignVertical: "top" }} hint={note.length + "/200 characters"} />
    <Txt className="text-muted" style={{ textAlign: "center", fontSize: 13 }}>Your money stays in your bank. Only your allocations change.</Txt>
    <ConfirmDialog open={funding !== null} onClose={() => { if (!busy) { setFunding(null); setError(""); } }} title="Review your balance">
      {funding ? <>
        <Txt>You have {money(funding.available)} available. Saving {money(funding.amount)} needs {money(funding.shortfall)} more.</Txt>
        {funding.bank !== funding.available ? <Txt className="text-muted" style={{ fontSize: 14 }}>Tracked bank balance: {money(funding.bank)}. Existing reservations: {money(funding.reserved)}.</Txt> : null}
        {hints.enabled ? <View className="bg-elevated rounded-2xl p-4 gap-2">
          <Txt style={{ fontWeight: "600" }}>{money(funding.bank)} + {money(funding.shortfall)} = {money(funding.requiredBank)}</Txt>
          <Txt style={{ fontSize: 14 }}>Reserve {money(funding.amount)} for {goal.name}; {money(0)} remains available. Existing savings and allowances stay reserved.</Txt>
        </View> : null}
        <View className="flex-row items-center justify-between gap-3"><Txt style={{ fontSize: 14, flex: 1 }}>Show explanations</Txt><Switch accessibilityLabel="Show funding explanations" value={hints.enabled} disabled={busy || hints.busy || !hints.ready} onValueChange={value => void hints.setEnabled(value)} trackColor={{ false: palette.line, true: palette.accent }} thumbColor={palette.foreground} /></View>
        <ErrorNotice message={hints.error} /><ErrorNotice message={error} />
        <Txt className="text-muted" style={{ fontSize: 13 }}>Confirm this reflects funds you actually have. Paycebo only updates your tracked balance.</Txt>
        <Button label={`Set balance to ${money(funding.requiredBank)} & save`} variant="secondary" loading={busy} onPress={() => void resolveFunding("set-balance")} />
        <Button label={`Add ${money(funding.shortfall)} & save`} loading={busy} onPress={() => void resolveFunding("top-up")} />
        <Button label="Cancel" variant="ghost" disabled={busy} onPress={() => { setFunding(null); setError(""); }} />
      </> : null}
    </ConfirmDialog>
    <ConfirmDialog open={confirmAmount !== null} onClose={() => { if (!busy) setConfirmAmount(null); }} title="Take a little back?">
          <Txt>{confirmAmount !== null ? withdrawalCopy(state, goal, confirmAmount) : ""}</Txt>
          <Txt className="text-muted" style={{ fontSize: 14 }}>Your goal’s progress will decrease. You can save again anytime.</Txt>
          <Button label={confirmAmount !== null ? "Take back " + money(confirmAmount) : "Confirm request"} variant="danger" loading={busy} onPress={() => { if (confirmAmount !== null) void commit(confirmAmount); }} />
          <Button label="Keep it saved" variant="secondary" disabled={busy} onPress={() => setConfirmAmount(null)} />
    </ConfirmDialog>
  </FormPage>;
}
