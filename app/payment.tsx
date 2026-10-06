import * as Haptics from "expo-haptics";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalAvatar } from "../src/components/GoalAvatar";
import { Button, DemoBanner, Display, Empty, ErrorNotice, Field, FormPage, Icon, Notice, palette, Txt } from "../src/components/ui";
import { addTransaction, money, parseMoney, progressFor, safeToSpend, savedFor, withdrawalCopy } from "../src/lib/model";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";

export default function Payment() {
  const { id, kind } = useLocalSearchParams<{ id: string; kind: string }>();
  const { state, update, now } = useSavings();
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
  function submit() {
    if (lock.current || !state || !goal) return;
    setError("");
    try {
      const value = parseMoney(amount);
      // Validate before prompting; commit repeats validation against the latest queued snapshot.
      addTransaction(state, goal.id, paid ? "contribution" : "withdrawal", value, note);
      if (paid) void commit(value);
      else setConfirmAmount(value);
    } catch (err) { setError(errorMessage(err)); }
  }
  if (success !== null) return <FormPage title={paid ? "A little win." : "Room to breathe."}>
    <DemoBanner />
    <View className="items-center py-10 gap-5" accessibilityLiveRegion="polite">
      <View className="h-20 w-20 rounded-full items-center justify-center bg-[#E2EEDD]"><Icon name="check" size={36} color={palette.positive} /></View>
      <Display style={{ fontSize: 40, lineHeight: 50 }}>{money(success)}</Display>
      <Txt style={{ textAlign: "center" }}>{paid ? "Saved for " : "Requested back from "}{goal.name}.</Txt>
      {note.trim() ? <Txt className="text-muted" style={{ textAlign: "center" }}>“{note.trim()}”</Txt> : null}
      <Txt className="text-muted" style={{ textAlign: "center" }}>{paid ? "Future you will remember this one." : "Your money. Your pace. Your call."}</Txt>
    </View>
    <Notice>Recorded on this device. Your bank balance hasn’t changed.</Notice>
    <Button label="Back to my goal" onPress={() => router.back()} />
  </FormPage>;
  return <FormPage title={paid ? "Pay your goal" : "Request Money"} busy={busy}>
    <DemoBanner />
    <View className="items-center gap-3"><GoalAvatar goal={goal} progress={progressFor(state, goal)} size={80} /><Display style={{ fontSize: 25, textAlign: "center" }}>{goal.name}</Display><Txt className="text-muted" style={{ fontSize: 14 }}>{paid ? "Available to save" : "Available to request"}: {money(maxAmount)}</Txt></View>
    <Field label="Amount (₹)" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="decimal-pad" maxLength={12} editable={!busy} style={{ fontSize: 36, lineHeight: 46, paddingVertical: 20, fontVariant: ["tabular-nums"] }} />
    <View className="flex-row flex-wrap gap-2">
      {[100, 500, 1000].filter((value) => value * 100 <= maxAmount).map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={"Use " + money(value * 100)} disabled={busy}
        className="min-h-[48px] px-4 justify-center rounded-full bg-elevated" onPress={() => setAmount(String(value))}><Txt style={{ fontSize: 14 }}>{money(value * 100)}</Txt></Pressable>)}
      {maxAmount > 0 ? <Pressable accessibilityRole="button" disabled={busy} className="min-h-[48px] px-4 justify-center rounded-full bg-elevated" onPress={() => setAmount((maxAmount / 100).toFixed(2))}><Txt className="text-positive" style={{ fontSize: 14 }}>{paid ? "Remaining" : "All saved"}</Txt></Pressable> : null}
    </View>
    <Field label={paid ? "What’s the little win? (optional)" : "Add a note (optional)"} value={note} onChangeText={setNote} placeholder={paid ? "Skipped ordering pizza" : "Needed a little breathing room"} maxLength={200} multiline editable={!busy} style={{ minHeight: 96, textAlignVertical: "top" }} hint={note.length + "/200 characters"} />
    <ErrorNotice message={error} />
    <Button label={paid ? "Pay " + goal.name : "Request Money"} icon={paid ? "arrow-up-right" : "arrow-down-left"} variant={paid ? "primary" : "secondary"} loading={busy} disabled={maxAmount <= 0} onPress={submit} />
    <Txt className="text-muted" style={{ textAlign: "center", fontSize: 13 }}>Your money stays in your bank. Only your allocations change.</Txt>
    <Modal transparent animationType="fade" visible={confirmAmount !== null} onRequestClose={() => { if (!busy) setConfirmAmount(null); }}>
      <SafeAreaView className="flex-1 justify-center items-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
        <View accessibilityViewIsModal className="w-full bg-surface rounded-2xl" style={{ maxWidth: 420, maxHeight: "90%" }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 20 }}>
          <Display style={{ fontSize: 28 }}>Take a little back?</Display>
          <Txt>{confirmAmount !== null ? withdrawalCopy(state, goal, confirmAmount) : ""}</Txt>
          <Txt className="text-muted" style={{ fontSize: 14 }}>Your goal’s progress will decrease. You can save again anytime.</Txt>
          <Button label={confirmAmount !== null ? "Take back " + money(confirmAmount) : "Confirm request"} variant="danger" loading={busy} onPress={() => { if (confirmAmount !== null) void commit(confirmAmount); }} />
          <Button label="Keep it saved" variant="secondary" disabled={busy} onPress={() => setConfirmAmount(null)} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  </FormPage>;
}
