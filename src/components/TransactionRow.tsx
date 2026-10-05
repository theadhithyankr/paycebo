import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { money, type Goal, type Transaction } from "../lib/model";
import { GoalAvatar } from "./GoalAvatar";
import { Icon, palette, Txt } from "./ui";

export function formatDate(value: string, includeTime = false): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric", month: "short",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" as const } : {}),
  });
}
export function TransactionRow({ transaction, goal }: { transaction: Transaction; goal: Goal }) {
  const paid = transaction.kind === "contribution";
  return <Pressable onPress={() => router.push({ pathname: "/goal/[id]", params: { id: goal.id } })}
    accessibilityRole="button" accessibilityLabel={(paid ? "Paid " : "Requested ") + money(transaction.amountPaise) + (paid ? " to " : " from ") + goal.name + ". " + transaction.note}
    className="flex-row items-center gap-3 py-4 border-b border-line"
    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
    <GoalAvatar goal={goal} size={48} />
    <View className="flex-1 gap-0.5">
      <Txt className="font-medium">{goal.name}</Txt>
      <Txt className="text-muted" style={{ fontSize: 13, lineHeight: 19 }}>{transaction.note || (paid ? "A little closer" : "Money requested back")}</Txt>
      <Txt className="text-muted" style={{ fontSize: 12, lineHeight: 18 }}>{formatDate(transaction.createdAt, true)}</Txt>
    </View>
    <View className="items-end gap-1">
      <Txt style={{ color: paid ? palette.positive : palette.danger, fontWeight: "600", fontVariant: ["tabular-nums"] }}>{paid ? "+" : "−"}{money(transaction.amountPaise)}</Txt>
      <View className="flex-row items-center gap-1"><Icon name={paid ? "arrow-up-right" : "arrow-down-left"} size={12} color={palette.muted} /><Txt className="text-muted" style={{ fontSize: 12 }}>{paid ? "Saved" : "Requested"}</Txt></View>
    </View>
  </Pressable>;
}
