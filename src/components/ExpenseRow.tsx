import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { money, type Allowance, type Expense } from "../lib/model";
import { GoalAvatar } from "./GoalAvatar";
import { formatDate } from "./TransactionRow";
import { palette, Txt } from "./ui";

export function ExpenseRow({ expense, allowance }: { expense: Expense; allowance: Allowance }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${money(expense.amountPaise)} spent on ${allowance.name}. ${expense.note}`}
    onPress={() => router.push({ pathname: "/allowance/[id]", params: { id: allowance.id } })} className="flex-row items-center gap-3 py-4 border-b border-line active:opacity-75">
    <GoalAvatar goal={allowance} size={48} accessibilityLabel={allowance.name} />
    <View className="flex-1 gap-1"><Txt className="font-medium">{allowance.name}</Txt><Txt className="text-muted" style={{ fontSize: 13 }}>{expense.note || "Allowance expense"}</Txt><Txt className="text-muted" style={{ fontSize: 12 }}>{formatDate(expense.createdAt, true)}</Txt></View>
    <View className="items-end"><Txt style={{ fontWeight: "600", color: palette.foreground }}>−{money(expense.amountPaise)}</Txt><Txt className="text-muted" style={{ fontSize: 12 }}>Spent</Txt></View>
  </Pressable>;
}
