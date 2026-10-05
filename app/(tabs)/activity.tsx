import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { TransactionRow } from "../../src/components/TransactionRow";
import { DemoBanner, Display, Empty, Page, palette, Txt } from "../../src/components/ui";
import { money, totalSaved, type TransactionKind } from "../../src/lib/model";
import { useSavings } from "../../src/state/SavingsProvider";

export default function Activity() {
  const { state } = useSavings();
  const [filter, setFilter] = useState<"all" | TransactionKind>("all");
  if (!state) return null;
  const transactions = [...state.transactions].reverse().filter((tx) => filter === "all" || tx.kind === filter);
  return <Page>
    <Display className="pt-6 pb-2" style={{ fontSize: 32 }}>Every little move.</Display>
    <Txt className="text-muted mb-6">The story behind your savings.</Txt>
    <DemoBanner />
    <View className="flex-row flex-wrap items-center gap-2 mb-6"><Txt style={{ fontSize: 28, lineHeight: 36, fontWeight: "600", color: palette.positive, flexShrink: 1 }}>{money(totalSaved(state))}</Txt><Txt className="text-muted">currently reserved</Txt></View>
    <View className="flex-row flex-wrap gap-2 mb-4">
      {([{ value: "all", label: "All moves" }, { value: "contribution", label: "Saved" }, { value: "withdrawal", label: "Requested" }] as const).map((item) =>
        <Pressable key={item.value} accessibilityRole="button" accessibilityState={{ selected: filter === item.value }} onPress={() => setFilter(item.value)} className="min-h-[48px] rounded-full px-4 justify-center"
          style={{ backgroundColor: filter === item.value ? palette.accent : palette.surface }}>
          <Txt style={{ color: filter === item.value ? "#17120D" : palette.muted, fontSize: 14, fontWeight: "500" }}>{item.label}</Txt>
        </Pressable>)}
    </View>
    {transactions.length ? transactions.map((tx) => {
      const goal = state.goals.find((item) => item.id === tx.goalId);
      return goal ? <TransactionRow key={tx.id} transaction={tx} goal={goal} /> : null;
    }) : <Empty icon="clock" title={filter === "all" ? "A fresh start" : "Nothing here yet"} description={filter === "all" ? "Pay a goal and add a note. Your savings story begins with one little move." : "Transactions of this kind will appear here."} />}
  </Page>;
}
