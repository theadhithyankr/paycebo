import { Redirect, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalAvatar } from "../../src/components/GoalAvatar";
import { formatDate } from "../../src/components/TransactionRow";
import { Button, DemoBanner, Display, Empty, Icon, IconButton, Page, palette, Txt } from "../../src/components/ui";
import { money, progressFor, savedFor, safeToSpend, type Reminder, type Transaction, WEEKDAYS } from "../../src/lib/model";
import { useSavings } from "../../src/state/SavingsProvider";

type ChatItem = { type: "transaction"; value: Transaction } | { type: "reminder"; value: Reminder };
export default function GoalChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, refreshReminders, now } = useSavings();
  const list = useRef<FlatList<ChatItem>>(null);
  const lastScrollCount = useRef(-1);
  useFocusEffect(useCallback(() => { void refreshReminders(); }, [refreshReminders]));
  if (!state) return <Redirect href="/" />;
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) return <Page><Empty title="Goal unavailable" description="Return home and choose a savings goal." action={<Button label="Go home" onPress={() => router.replace("/(tabs)")} />} /></Page>;
  const saved = savedFor(state, goal.id);
  const progress = progressFor(state, goal);
  const items: ChatItem[] = [
    ...state.transactions.filter((tx) => tx.goalId === goal.id).map((value): ChatItem => ({ type: "transaction", value })),
    ...state.reminders.filter((item) => item.goalId === goal.id).map((value): ChatItem => ({ type: "reminder", value })),
  ].sort((a, b) => Date.parse(a.value.createdAt) - Date.parse(b.value.createdAt));
  function pay(kind: "contribution" | "withdrawal") {
    router.push({ pathname: "/payment", params: { id: goal!.id, kind } });
  }
  return <Page scroll={false}>
    <View className="flex-row items-center gap-2 px-3 py-2 border-b border-line">
      <IconButton name="arrow-left" label="Back to goals" onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} />
      <GoalAvatar goal={goal} progress={progress} size={44} />
      <View className="flex-1 ml-1"><Txt className="font-medium">{goal.name}</Txt><Txt className="text-muted" style={{ fontSize: 12, lineHeight: 18 }}>{progress >= 1 ? "Goal funded. Look at you." : "Your future is listening."}</Txt></View>
      <IconButton name="edit-2" label={"Edit " + goal.name} onPress={() => router.push({ pathname: "/goal-form", params: { id: goal.id } })} />
    </View>
    <FlatList ref={list} data={items} keyExtractor={(item) => item.value.id} showsVerticalScrollIndicator={false}
      onContentSizeChange={() => {
        if (lastScrollCount.current !== items.length) {
          lastScrollCount.current = items.length;
          requestAnimationFrame(() => list.current?.scrollToEnd({ animated: false }));
        }
      }}
      contentContainerStyle={{ padding: 24, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled"
      ListHeaderComponent={<View className="gap-5 mb-4">
        <DemoBanner />
        <View className="items-center gap-2 py-3">
          <GoalAvatar goal={goal} progress={progress} size={100} />
          <Display style={{ fontSize: 34, lineHeight: 44, marginTop: 8 }}>{money(saved)}</Display>
          <Txt className="text-muted" style={{ fontSize: 14 }}>of {money(goal.targetPaise)} · {Math.round(progress * 100)}% saved</Txt>
          <View className="h-1.5 w-full rounded-full bg-line mt-3 overflow-hidden"><View style={{ width: `${progress * 100}%`, height: "100%", backgroundColor: goal.color }} /></View>
          <Txt className="text-muted" style={{ fontSize: 13, textAlign: "center" }}>{goal.weeklyPaise ? money(goal.weeklyPaise) + " weekly · " + WEEKDAYS[goal.dueDay - 1] : "At your own pace. Every little bit counts."}</Txt>
        </View>
        <View className="self-start rounded-2xl rounded-tl-sm bg-surface p-4" style={{ maxWidth: "90%" }}>
          <Txt>{state.tone === "playful" ? "Hey, it’s me. Your " + goal.name + ". Every time you pay me, we get a little closer. Shall we?" : "This is your space to save for " + goal.name + ". Add a payment whenever it works for you."}</Txt>
          <Txt className="text-muted mt-2" style={{ fontSize: 11, lineHeight: 16 }}>Goal message · {formatDate(goal.createdAt)}</Txt>
        </View>
      </View>}
      renderItem={({ item }) => {
        if (item.type === "reminder") return <View className="self-start rounded-2xl rounded-tl-sm bg-surface p-4" style={{ maxWidth: "90%" }}>
          <Txt>{item.value.text}</Txt><Txt className="text-muted mt-2" style={{ fontSize: 11, lineHeight: 16 }}>Weekly reminder · {formatDate(item.value.createdAt, true)}</Txt>
        </View>;
        const tx = item.value;
        const paid = tx.kind === "contribution";
        return <View className="self-end rounded-2xl rounded-tr-sm p-4 gap-2" style={{ maxWidth: "90%", minWidth: 170, backgroundColor: paid ? "#E2EEDD" : "#FCE9E9" }}>
          <View className="flex-row items-center gap-2"><Icon name={paid ? "arrow-up-right" : "arrow-down-left"} size={18} color={paid ? palette.positive : palette.danger} /><Txt style={{ color: paid ? palette.positive : palette.danger, fontSize: 12 }}>{paid ? "Paid to your goal" : "Requested back"}</Txt></View>
          <Txt style={{ fontSize: 30, lineHeight: 38, fontWeight: "600", fontVariant: ["tabular-nums"] }}>{paid ? "" : "−"}{money(tx.amountPaise)}</Txt>
          {tx.note ? <Txt>{tx.note}</Txt> : null}
          <View className="flex-row items-center justify-between gap-4"><Txt className="text-muted" style={{ fontSize: 11, lineHeight: 16 }}>{formatDate(tx.createdAt, true)}</Txt><Icon name="check" size={13} color={paid ? palette.positive : palette.danger} /></View>
        </View>;
      }}
      ListFooterComponent={progress >= 1 ? <View className="items-center py-6 gap-2"><Icon name="check-circle" size={26} color={palette.positive} /><Display style={{ fontSize: 25 }}>You made it.</Display><Txt className="text-muted" style={{ textAlign: "center" }}>Fully funded. Take a moment to enjoy that.</Txt></View> : items.length === 0 ? <Txt className="text-muted py-4" style={{ textAlign: "center", fontSize: 13 }}>No payments yet. Your first little win is waiting.</Txt> : null} />
    <SafeAreaView edges={["bottom"]} className="border-t border-line bg-background px-6 pt-4">
      <View className="flex-row flex-wrap gap-3"><View className="flex-1" style={{ minWidth: 140 }}><Button label="Request Money" variant="secondary" disabled={saved <= 0} onPress={() => pay("withdrawal")} /></View><View className="flex-1" style={{ minWidth: 100 }}><Button label={progress >= 1 ? "Funded" : "Pay"} icon={progress >= 1 ? "check" : "arrow-up-right"} disabled={progress >= 1 || safeToSpend(state, now) <= 0} onPress={() => pay("contribution")} /></View></View>
      <Txt className="text-muted py-3" style={{ textAlign: "center", fontSize: 12, lineHeight: 18 }}>{safeToSpend(state, now) <= 0 && progress < 1 ? "Update your bank balance or request funds back to pay a goal." : "An allocation, not a bank transfer."}</Txt>
    </SafeAreaView>
  </Page>;
}
