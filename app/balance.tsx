import { Redirect, router } from "expo-router";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { Button, DemoBanner, ErrorNotice, Field, FormPage, Notice, Txt } from "../src/components/ui";
import { inputMoney, money, parseMoney, totalSaved, totalAllowanceReserved, updateBalance, safeToSpend } from "../src/lib/model";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";

export default function Balance() {
  const { state, update, now } = useSavings();
  const [amount, setAmount] = useState(state ? inputMoney(state.bankBalancePaise) : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  if (!state) return <Redirect href="/" />;
  let preview: number | null = null;
  try { preview = safeToSpend(updateBalance(state, parseMoney(amount, true)), now); } catch {}
  async function save() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { const balance = parseMoney(amount, true); await update((current) => updateBalance(current, balance)); router.back(); }
    catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <FormPage title="Update bank balance" busy={busy} footer={<><ErrorNotice message={error} /><Button label="Update balance" loading={busy} onPress={() => void save()} /></>}>
    <DemoBanner />
    <Field label="Current bank balance (₹)" hint="Enter your actual current balance, including money reserved for goals." value={amount} onChangeText={setAmount} keyboardType="decimal-pad" maxLength={12} editable={!busy} />
    <View className="gap-2"><Txt className="text-muted">Reserved for goals: {money(totalSaved(state))}</Txt><Txt className="text-muted">Reserved for allowances: {money(totalAllowanceReserved(state, now))}</Txt><Txt className="font-medium">Safe to Spend after update: {preview === null ? "Enter a valid amount" : money(preview)}</Txt></View>
    {preview !== null && preview < 0 ? <Notice>Your reservations exceed this balance. Existing savings will be kept, but new contributions will pause until funds are available.</Notice> : null}
    <Notice>This changes the balance you entered, not your goal history. No bank connection is involved.</Notice>
  </FormPage>;
}
