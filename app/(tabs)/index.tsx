import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { GoalAvatar } from "../../src/components/GoalAvatar";
import { formatDate, TransactionRow } from "../../src/components/TransactionRow";
import { Button, DemoBanner, Display, Empty, ErrorNotice, Icon, IconButton, Mark, Notice, Page, palette, Txt } from "../../src/components/ui";
import { money, progressFor, safeToSpend, savedFor, totalSaved, weeklyRemaining, WEEKDAYS } from "../../src/lib/model";
import { useSavings } from "../../src/state/SavingsProvider";

export default function Home() {
  const { state, reminderError, refreshReminders } = useSavings();
  useFocusEffect(useCallback(() => { void refreshReminders(); }, [refreshReminders]));
  if (!state) return null;
  const safe = safeToSpend(state);
  const available = money(safe);
  const saved = totalSaved(state);
  const transactions = [...state.transactions].reverse().slice(0, 4);
  const nextGoal = state.goals.find((goal) => goal.weeklyPaise > 0 && weeklyRemaining(state, goal) > 0);
  return <Page>
    <View className="flex-row items-center justify-between pt-3 pb-5">
      <View className="flex-row items-center gap-2"><Mark /><Txt style={{ fontSize: 24, fontWeight: "600", letterSpacing: -0.8 }}>paycebo</Txt></View>
      <IconButton name="plus" label="Create a savings goal" onPress={() => router.push("/goal-form")} />
    </View>
    <DemoBanner />
    {reminderError ? <View className="mb-4"><ErrorNotice message={"A reminder couldn’t be saved. " + reminderError} /></View> : null}
    <LinearGradient colors={["#211A15", "#2A211A", "#443024"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ padding: 24, borderRadius: 28, gap: 14 }}>
      <View className="flex-row items-center justify-between"><Txt style={{ color: "#DEC8B6", fontSize: 15 }}>Safe to Spend</Txt><Icon name="shield" size={18} color="#DEC8B6" /></View>
      <Txt accessibilityLabel={"Safe to Spend " + available} style={{ color: safe < 0 ? palette.danger : palette.foreground, fontSize: available.length > 12 ? 34 : available.length > 9 ? 42 : 52, lineHeight: available.length > 12 ? 44 : 64, fontWeight: "600", letterSpacing: -1.2, fontVariant: ["tabular-nums"] }}>{available}</Txt>
      <Txt style={{ color: "#DEC8B6", fontSize: 14, lineHeight: 21 }}>{safe < 0 ? "Your goals exceed your entered bank balance." : saved > 0 ? "Room for today. Something for tomorrow." : "Your next little win starts here."}</Txt>
      <View className="h-px bg-[#6B5140] my-1" />
      <View className="flex-row flex-wrap justify-between gap-3">
        <View><Txt style={{ color: "#DEC8B6", fontSize: 12 }}>Bank balance</Txt><Txt className="font-medium">{money(state.bankBalancePaise)}</Txt></View>
        <View><Txt style={{ color: "#DEC8B6", fontSize: 12 }}>Reserved for goals</Txt><Txt className="font-medium">{money(saved)}</Txt></View>
      </View>
      <Pressable className="flex-row items-center justify-between min-h-[48px] pt-2" accessibilityRole="button" accessibilityLabel="Update your manually entered bank balance" onPress={() => router.push("/balance")}>
        <Txt style={{ color: "#DEC8B6", fontSize: 12 }}>Manually updated {formatDate(state.balanceUpdatedAt)}</Txt>
        <View className="flex-row items-center gap-1"><Txt style={{ color: palette.accent, fontSize: 13, fontWeight: "600" }}>Update</Txt><Icon name="arrow-up-right" size={14} color={palette.accent} /></View>
      </Pressable>
    </LinearGradient>
    <View className="flex-row items-center justify-between mt-8 mb-4">
      <Display style={{ fontSize: 25, lineHeight: 32 }}>Pay your goals</Display>
      <Txt className="text-muted" style={{ fontSize: 13 }}>{state.goals.length} {state.goals.length === 1 ? "contact" : "contacts"}</Txt>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingBottom: 8 }}>
      {state.goals.map((goal) => <Pressable key={goal.id} className="items-center gap-2" style={({ pressed }) => ({ width: 88, opacity: pressed ? 0.65 : 1 })}
        accessibilityRole="button" accessibilityLabel={goal.name + ". " + money(savedFor(state, goal.id)) + " of " + money(goal.targetPaise) + ". Open conversation."}
        onPress={() => router.push({ pathname: "/goal/[id]", params: { id: goal.id } })}>
        <GoalAvatar goal={goal} progress={progressFor(state, goal)} />
        <Txt style={{ fontSize: 13, lineHeight: 18, textAlign: "center" }}>{goal.name}</Txt>
        <Txt style={{ fontSize: 12, lineHeight: 16, color: goal.color }}>{Math.round(progressFor(state, goal) * 100)}%</Txt>
      </Pressable>)}
      <Pressable accessibilityRole="button" accessibilityLabel="Add a new goal" onPress={() => router.push("/goal-form")} className="items-center gap-2" style={{ width: 88 }}>
        <View className="w-[76px] h-[76px] border border-dashed border-line rounded-full items-center justify-center"><Icon name="plus" size={24} color={palette.muted} /></View>
        <Txt className="text-muted" style={{ fontSize: 13 }}>New goal</Txt>
      </Pressable>
    </ScrollView>
    {!state.goals.length ? <Empty title="Meet your future" description="Add something you’re saving for. Then pay it a little at a time." action={<Button label="Add your first goal" icon="plus" onPress={() => router.push("/goal-form")} />} /> : null}
    {nextGoal ? <Pressable accessibilityRole="button" accessibilityLabel={"Open " + nextGoal.name + " weekly pledge"} onPress={() => router.push({ pathname: "/goal/[id]", params: { id: nextGoal.id } })}
      className="flex-row items-start gap-3 bg-surface rounded-2xl p-4 mt-6">
      <View className="mt-1"><Icon name="message-circle" color={nextGoal.color} /></View>
      <View className="flex-1 gap-1"><Txt className="font-medium">A little nudge from {nextGoal.name}</Txt><Txt className="text-muted" style={{ fontSize: 14, lineHeight: 21 }}>{money(weeklyRemaining(state, nextGoal))} left for your {WEEKDAYS[nextGoal.dueDay - 1]} pledge.</Txt></View>
      <Icon name="chevron-right" size={18} color={palette.muted} />
    </Pressable> : null}
    <View className="flex-row items-center justify-between mt-7">
      <Display style={{ fontSize: 25, lineHeight: 32 }}>Little wins</Display>
      <Pressable className="min-h-[48px] justify-center pl-3" accessibilityRole="button" accessibilityLabel="View all activity" onPress={() => router.push("/(tabs)/activity")}><Txt className="text-accent" style={{ fontSize: 13 }}>View all</Txt></Pressable>
    </View>
    {transactions.length ? transactions.map((tx) => {
      const goal = state.goals.find((item) => item.id === tx.goalId);
      return goal ? <TransactionRow key={tx.id} transaction={tx} goal={goal} /> : null;
    }) : <Txt className="text-muted py-5">Your first payment will appear here. Small counts.</Txt>}
    <View className="mt-6"><Notice>Payments reserve money for your goals. Nothing leaves your bank account.</Notice></View>
  </Page>;
}
