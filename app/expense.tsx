import * as Haptics from "expo-haptics";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { Button, ConfirmDialog, Display, ErrorNotice, Field, FormPage, Icon, Notice, palette, Txt } from "../src/components/ui";
import { addExpense, allowanceRemaining, money, parseMoney } from "../src/lib/model";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";

export default function ExpenseForm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, now, update } = useSavings();
  const [amount, setAmount] = useState(""); const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState<number | null>(null); const [success, setSuccess] = useState<number | null>(null);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const lock = useRef(false);
  if (!state) return <Redirect href="/" />;
  const allowance = state.allowances.find((item) => item.id === id);
  if (!allowance || allowance.archived) return <FormPage title="Allowance unavailable"><Txt>Choose an active allowance from Home.</Txt></FormPage>;
  const remaining = allowanceRemaining(state, allowance, now);
  async function commit(value: number, accepted: boolean) {
    if (lock.current || success !== null) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await update((current) => addExpense(current, id, value, note, accepted));
      setConfirm(null); setSuccess(value); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) { setConfirm(null); setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  function submit() {
    if (lock.current) return;
    setError("");
    try {
      const value = parseMoney(amount);
      addExpense(state!, id, value, note, true);
      if (value > remaining) setConfirm(value); else void commit(value, false);
    } catch (err) { setError(errorMessage(err)); }
  }
  if (success !== null) return <FormPage title="Spending recorded">
    <View className="items-center py-8 gap-4"><Icon name="check-circle" size={48} color={palette.positive} /><Display>{money(success)}</Display><Txt>Spent on {allowance.name}</Txt></View>
    <Notice>Your tracked bank balance is now {money(state.bankBalancePaise)}. No money was transferred by Paycebo.</Notice>
    <Button label="Back to allowance" onPress={() => router.back()} />
  </FormPage>;
  return <FormPage title={"Spent on " + allowance.name} busy={busy}>
    <Txt className="text-muted">{money(remaining)} left this {allowance.frequency === "daily" ? "day" : allowance.frequency === "weekly" ? "week" : "month"}</Txt>
    <Field label="Amount spent (₹)" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="decimal-pad" maxLength={12} editable={!busy} style={{ fontSize: 32, lineHeight: 42 }} />
    <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. Lunch" maxLength={200} editable={!busy} />
    <Txt className="text-muted" style={{ fontSize: 14 }}>Recording spending adjusts your tracked bank balance.</Txt>
    <ErrorNotice message={error} /><Button label="Record expense" loading={busy} onPress={submit} />
    <ConfirmDialog open={confirm !== null} onClose={() => { if (!busy) setConfirm(null); }} title="A little over your allowance">
      <Txt>This expense puts you {money(Math.max(0, (confirm ?? 0) - remaining))} beyond the remaining allowance. Record what actually happened?</Txt>
      <Button label="Record anyway" loading={busy} onPress={() => { if (confirm !== null) void commit(confirm, true); }} /><Button label="Go back" variant="secondary" disabled={busy} onPress={() => setConfirm(null)} />
    </ConfirmDialog>
  </FormPage>;
}
