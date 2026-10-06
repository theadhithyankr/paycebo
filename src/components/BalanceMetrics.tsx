import React from "react";
import { useWindowDimensions, View } from "react-native";
import { money } from "../lib/model";
import { useAppTheme } from "../state/AppearanceProvider";
import { Icon, Txt, type IconName } from "./ui";

export function BalanceMetrics({ bank, saved, allowance }: { bank: number; saved: number; allowance: number }) {
  const { colors } = useAppTheme(); const { width, fontScale } = useWindowDimensions();
  const stacked = width < 360 || fontScale > 1.2 || Math.max(...[bank, saved, allowance].map(value => money(value).length)) > 12;
  const items: { label: string; value: number; icon: IconName }[] = [
    { label: "Bank balance", value: bank, icon: "credit-card" }, { label: "Saved", value: saved, icon: "target" }, { label: "Allowance left", value: allowance, icon: "coffee" },
  ];
  return <View style={{ borderRadius: 16, backgroundColor: "#FFFFFF10", paddingHorizontal: 16 }}>
    {items.map((item, index) => <View key={item.label} style={{ minHeight: 56, paddingVertical: 12, gap: 8,
      borderBottomWidth: index < items.length - 1 ? 1 : 0, borderBottomColor: "#FFFFFF18", flexDirection: stacked ? "column" : "row", alignItems: stacked ? "stretch" : "center" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: stacked ? undefined : 1 }}>
        <Icon name={item.icon} size={18} color={colors.accent} />
        <Txt style={{ color: colors.darkMuted, fontSize: 14, lineHeight: 21, flexShrink: 1 }}>{item.label}</Txt>
      </View>
      <Txt accessibilityLabel={item.label + " " + money(item.value)} style={{ color: colors.onDark, fontWeight: "700", fontSize: 22, lineHeight: 30,
        fontVariant: ["tabular-nums"], textAlign: "right", flexShrink: 0 }}>{money(item.value)}</Txt>
    </View>)}
  </View>;
}
