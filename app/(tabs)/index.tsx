import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { GoalAvatar } from "../../src/components/GoalAvatar";
import { ExpenseRow } from "../../src/components/ExpenseRow";
import { TransactionRow } from "../../src/components/TransactionRow";
import { ActionSheet, Button, DemoBanner, Display, ErrorNotice, Icon, Mark, Page, palette, Txt } from "../../src/components/ui";
import { allowanceRemaining, allowanceSpent, money, progressFor, safeToSpend, savedFor, totalAllowanceReserved, totalSaved } from "../../src/lib/model";
import { useSavings } from "../../src/state/SavingsProvider";

export default function Home() {
  const { state, now, reminderError, refreshReminders } = useSavings();
  const [adding, setAdding] = useState(false);
  useFocusEffect(useCallback(() => { void refreshReminders(); }, [refreshReminders]));
  if (!state) return null;
  const safe = safeToSpend(state, now);
  const allowances = state.allowances.filter((item) => !item.archived);
  const entries = [
    ...state.transactions.map((entry) => ({ kind: "saving" as const, entry })),
    ...state.expenses.map((entry) => ({ kind: "expense" as const, entry })),
  ].sort((a, b) => Date.parse(b.entry.createdAt) - Date.parse(a.entry.createdAt)).slice(0, 4);
  return <Page dark padded={false}>
    <LinearGradient colors={["#0B1711", "#284E33"]} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28, gap: 16 }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2"><Mark color={palette.accent} /><Txt style={{ fontSize: 24, fontWeight: "700", color: palette.onDark }}>paycebo</Txt></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add a goal or allowance" onPress={() => setAdding(true)} className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: "#FFFFFF12", borderWidth: 1, borderColor: "#FFFFFF25" }}><Icon name="plus" color={palette.onDark} /></Pressable>
      </View>
      <View className="gap-2"><Txt style={{ color: palette.darkMuted }}>Safe to Spend</Txt>
        <Txt accessibilityLabel={"Safe to Spend " + money(safe)} style={{ color: safe < 0 ? "#FFB9B9" : palette.onDark, fontSize: money(safe).length > 10 ? 36 : 44, lineHeight: 54, fontWeight: "700", letterSpacing: -1.2, fontVariant: ["tabular-nums"] }}>{money(safe)}</Txt>
        <Txt style={{ color: palette.darkMuted, fontSize: 14 }}>{safe < 0 ? "Your reservations exceed your balance. Update it before saving more." : "For today. With tomorrow taken care of."}</Txt>
      </View>
      <View className="flex-row flex-wrap gap-5">
        {[{ label: "Bank balance", value: state.bankBalancePaise }, { label: "Saved", value: totalSaved(state) }, { label: "Allowances", value: totalAllowanceReserved(state, now) }].map((item) => <View key={item.label} className="gap-1"><Txt style={{ color: palette.darkMuted, fontSize: 12 }}>{item.label}</Txt><Txt style={{ color: palette.onDark, fontWeight: "600", fontSize: 15 }}>{money(item.value)}</Txt></View>)}
      </View>
      <View className="flex-row gap-3">
        {[{ label: "Update balance", icon: "refresh-cw" as const, action: () => router.push("/balance") }, { label: "New allowance", icon: "coffee" as const, action: () => router.push("/allowance-form") }, { label: "New goal", icon: "target" as const, action: () => router.push("/goal-form") }].map((item) => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} onPress={item.action} className="flex-1 items-center justify-center gap-1.5 rounded-2xl py-3" style={{ minHeight: 72, backgroundColor: "#FFFFFF10", borderWidth: 1, borderColor: "#FFFFFF20" }}><Icon name={item.icon} color={palette.accent} size={22} /><Txt style={{ color: palette.onDark, fontSize: 12, lineHeight: 17, textAlign: "center" }}>{item.label}</Txt></Pressable>)}
      </View>
    </LinearGradient>
    <View style={{ backgroundColor: palette.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -12, padding: 24, flex: 1, gap: 24 }}>
      <DemoBanner />
      <ErrorNotice message={reminderError} />
      <View className="gap-4">
        <View className="flex-row justify-between items-center"><Display style={{ fontSize: 23, lineHeight: 32 }}>Your future contacts</Display><Pressable accessibilityRole="button" accessibilityLabel="Add savings goal" onPress={() => router.push("/goal-form")} className="h-12 w-12 items-center justify-center"><Icon name="plus" color={palette.accentText} /></Pressable></View>
        {state.goals.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>{state.goals.map((goal) => <Pressable key={goal.id} accessibilityRole="button" accessibilityLabel={`${goal.name}. ${money(savedFor(state, goal.id))} saved. Open goal.`}
          onPress={() => router.push({ pathname: "/goal/[id]", params: { id: goal.id } })} style={{ width: 86, alignItems: "center", gap: 7 }}>
          <GoalAvatar goal={goal} progress={progressFor(state, goal)} size={72} /><Txt style={{ fontSize: 13, lineHeight: 18, textAlign: "center" }}>{goal.name}</Txt><Txt style={{ fontSize: 12, color: palette.muted }}>{Math.round(progressFor(state, goal) * 100)}%</Txt>
        </Pressable>)}</ScrollView> : <View className="gap-3"><Txt className="text-muted">Give something you want a place in your future.</Txt><Button label="Add a savings goal" onPress={() => router.push("/goal-form")} variant="secondary" /></View>}
      </View>
      <View className="gap-3">
        <View className="flex-row justify-between items-center"><Display style={{ fontSize: 23 }}>For everyday</Display><Pressable accessibilityRole="button" accessibilityLabel="Add allowance" onPress={() => router.push("/allowance-form")} className="h-12 w-12 items-center justify-center"><Icon name="plus" color={palette.accentText} /></Pressable></View>
        {allowances.length ? allowances.map((allowance) => {
          const remaining = allowanceRemaining(state, allowance, now); const spent = allowanceSpent(state, allowance, now); const over = Math.max(0, spent - allowance.amountPaise);
          return <Pressable key={allowance.id} accessibilityRole="button" accessibilityLabel={`${allowance.name}. ${money(remaining)} remaining. Open allowance.`} onPress={() => router.push({ pathname: "/allowance/[id]", params: { id: allowance.id } })}
            className="flex-row items-center gap-3 bg-surface rounded-2xl p-4">
            <GoalAvatar goal={allowance} progress={Math.min(1, spent / allowance.amountPaise)} size={52} accessibilityLabel={allowance.name} />
            <View className="flex-1 gap-1"><Txt className="font-medium">{allowance.name}</Txt><Txt className="text-muted" style={{ fontSize: 12 }}>{money(allowance.amountPaise)} / {allowance.frequency === "daily" ? "day" : allowance.frequency === "weekly" ? "week" : "month"}</Txt></View>
            <View className="items-end"><Txt style={{ color: over > 0 ? palette.danger : palette.accentText, fontWeight: "700" }}>{money(over || remaining)}</Txt><Txt className="text-muted" style={{ fontSize: 12 }}>{over > 0 ? "over budget" : "left"}</Txt></View>
          </Pressable>;
        }) : <Pressable accessibilityRole="button" accessibilityLabel="Create your first allowance" onPress={() => router.push("/allowance-form")} className="bg-[#E2EEDD] rounded-2xl p-5 gap-2"><Icon name="coffee" color={palette.accentText} /><Txt className="font-medium">A little for food, travel, or everyday life.</Txt><Txt style={{ color: palette.accentText, fontSize: 14 }}>Create an allowance →</Txt></Pressable>}
      </View>
      <View><View className="flex-row items-center justify-between"><Display style={{ fontSize: 23 }}>Recent activity</Display><Pressable accessibilityRole="button" accessibilityLabel="View all activity" onPress={() => router.push("/(tabs)/activity")} className="min-h-[48px] justify-center"><Txt style={{ color: palette.accentText, fontSize: 13 }}>See all</Txt></Pressable></View>
        {entries.length ? entries.map((item) => {
          if (item.kind === "expense") { const allowance = state.allowances.find((a) => a.id === item.entry.allowanceId); return allowance ? <ExpenseRow key={item.entry.id} expense={item.entry} allowance={allowance} /> : null; }
          const goal = state.goals.find((g) => g.id === item.entry.goalId); return goal ? <TransactionRow key={item.entry.id} transaction={item.entry} goal={goal} /> : null;
        }) : <Txt className="text-muted py-4">Your first little move will appear here.</Txt>}
      </View>
    </View>
    <ActionSheet open={adding} onClose={() => setAdding(false)} title="Make room for something">
      <Button label="Savings goal" icon="target" onPress={() => { setAdding(false); router.push("/goal-form"); }} />
      <Button label="Allowance" icon="coffee" variant="secondary" onPress={() => { setAdding(false); router.push("/allowance-form"); }} />
    </ActionSheet>
  </Page>;
}
