import { useAppTheme } from "../../src/state/AppearanceProvider";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import { GoalAvatar } from "../../src/components/GoalAvatar";
import { ExpenseRow } from "../../src/components/ExpenseRow";
import { Button, ConfirmDialog, Display, Empty, ErrorNotice, IconButton, Page, Txt } from "../../src/components/ui";
import { allowanceRemaining, allowanceSpent, archiveAllowance, money } from "../../src/lib/model";
import { errorMessage, useSavings } from "../../src/state/SavingsProvider";

export default function AllowanceDetail() {
  const { colors: palette } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, now, update } = useSavings();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  if (!state) return <Redirect href="/" />;
  const allowance = state.allowances.find((item) => item.id === id);
  if (!allowance) return <Page><Empty title="Allowance unavailable" description="Choose another allowance from Home." action={<Button label="Go home" onPress={() => router.replace("/(tabs)")} />} /></Page>;
  const spent = allowanceSpent(state, allowance, now);
  const remaining = allowanceRemaining(state, allowance, now);
  const over = Math.max(0, spent - allowance.amountPaise);
  const entries = state.expenses.filter((item) => item.allowanceId === id).slice().reverse();
  async function archive() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await update((current) => archiveAllowance(current, id)); setConfirm(false); }
    catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Page>
    <View className="flex-row items-center justify-between py-3"><IconButton name="arrow-left" label="Back to home" onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} /><Display style={{ fontSize: 22 }}>Allowance</Display><IconButton name="edit-2" label="Edit allowance" disabled={allowance.archived} onPress={() => router.push({ pathname: "/allowance-form", params: { id } })} /></View>
    <View className="items-center py-6 gap-3">
      <GoalAvatar goal={allowance} progress={Math.min(1, spent / allowance.amountPaise)} size={96} accessibilityLabel={`${allowance.name}, ${money(remaining)} remaining`} />
      <Display style={{ textAlign: "center" }}>{allowance.name}</Display><Txt className="text-muted">{money(allowance.amountPaise)} · {allowance.frequency}{allowance.archived ? " · archived" : ""}</Txt>
      <Txt className="text-muted" style={{ fontSize: 13 }}>{allowance.frequency === "daily" ? "Today" : allowance.frequency === "weekly" ? "This week · resets Monday" : "This month · resets on the 1st"}</Txt>
    </View>
    <View className="bg-surface rounded-2xl p-6 gap-4 mb-5"><Txt className="text-muted">{over > 0 ? "Over budget" : "Remaining this period"}</Txt><Display style={{ fontSize: 40, lineHeight: 50, color: over > 0 ? palette.danger : palette.foreground }}>{money(over > 0 ? over : remaining)}</Display><Txt className="text-muted">Spent {money(spent)} of {money(allowance.amountPaise)}</Txt></View>
    <ErrorNotice message={error} />
    {!allowance.archived ? <Button label="Record spending" icon="minus" onPress={() => router.push({ pathname: "/expense", params: { id } })} /> : null}
    <Display className="mt-7 mb-2" style={{ fontSize: 24 }}>Spending history</Display>
    {entries.length ? entries.map((expense) => <ExpenseRow key={expense.id} expense={expense} allowance={allowance} />) : <Txt className="text-muted py-5">Your expenses will appear here.</Txt>}
    {!allowance.archived ? <View className="mt-6"><Button label="Archive allowance" variant="ghost" onPress={() => setConfirm(true)} /></View> : null}
    <ConfirmDialog open={confirm} onClose={() => { if (!busy) setConfirm(false); }} title="Archive this allowance?">
      <Txt>The remaining reservation will be released. Your spending history stays here.</Txt><ErrorNotice message={error} />
      <Button label="Archive allowance" variant="danger" loading={busy} onPress={() => void archive()} /><Button label="Keep allowance" variant="secondary" disabled={busy} onPress={() => setConfirm(false)} />
    </ConfirmDialog>
  </Page>;
}
