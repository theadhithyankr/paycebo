import { useAppTheme } from "../../src/state/AppearanceProvider";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { TransactionRow } from "../../src/components/TransactionRow";
import { ExpenseRow } from "../../src/components/ExpenseRow";
import { DemoBanner, Display, Empty, Page, Txt } from "../../src/components/ui";
import { money, totalSaved, type TransactionKind } from "../../src/lib/model";
import { useSavings } from "../../src/state/SavingsProvider";

export default function Activity() {
  const { colors: palette } = useAppTheme();
  const { state } = useSavings();
  const [filter, setFilter] = useState<"all" | TransactionKind | "expense">("all");
  if (!state) return null;
  const entries = [...state.transactions.map((entry) => ({ type: "saving" as const, entry })), ...state.expenses.map((entry) => ({ type: "expense" as const, entry }))]
    .filter((item) => filter === "all" || (item.type === "expense" ? filter === "expense" : filter === item.entry.kind))
    .sort((a, b) => Date.parse(b.entry.createdAt) - Date.parse(a.entry.createdAt));
  return <Page dock>
    <Display className="pt-6 pb-2" style={{ fontSize: 32 }}>Every little move.</Display>
    <Txt className="text-muted mb-6">Savings and everyday spending.</Txt>
    <DemoBanner />
    <View className="flex-row flex-wrap items-center gap-2 mb-6"><Txt style={{ fontSize: 28, lineHeight: 36, fontWeight: "600", color: palette.positive, flexShrink: 1 }}>{money(totalSaved(state))}</Txt><Txt className="text-muted">saved for goals</Txt></View>
    <View className="flex-row flex-wrap gap-2 mb-4">
      {([{ value: "all", label: "All moves" }, { value: "contribution", label: "Saved" }, { value: "withdrawal", label: "Requested" }, { value: "expense", label: "Expenses" }] as const).map((item) =>
        <Pressable key={item.value} accessibilityRole="button" accessibilityState={{ selected: filter === item.value }} onPress={() => setFilter(item.value)} className="min-h-[48px] rounded-full px-4 justify-center"
          style={{ backgroundColor: filter === item.value ? palette.accent : palette.surface }}>
          <Txt style={{ color: filter === item.value ? "#102015" : palette.muted, fontSize: 14, fontWeight: "500" }}>{item.label}</Txt>
        </Pressable>)}
    </View>
    {entries.length ? entries.map((item) => {
      if (item.type === "expense") { const allowance = state.allowances.find((a) => a.id === item.entry.allowanceId); return allowance ? <ExpenseRow key={item.entry.id} expense={item.entry} allowance={allowance} /> : null; }
      const goal = state.goals.find((goal) => goal.id === item.entry.goalId);
      return goal ? <TransactionRow key={item.entry.id} transaction={item.entry} goal={goal} /> : null;
    }) : <Empty icon="clock" title={filter === "all" ? "A fresh start" : "Nothing here yet"} description={filter === "all" ? "Pay a goal and add a note. Your savings story begins with one little move." : "Transactions of this kind will appear here."} />}
  </Page>;
}
