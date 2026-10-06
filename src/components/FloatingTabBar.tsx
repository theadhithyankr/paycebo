import React, { useEffect, useState } from "react";
import { Keyboard, Platform, Pressable, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../state/AppearanceProvider";
import { Icon, Txt, type IconName } from "./ui";

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useAppTheme(); const insets = useSafeAreaInsets();
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setTyping(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setTyping(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  if (typing) return null;
  const icons: Record<string, IconName> = { index: "home", activity: "bar-chart-2", settings: "sliders" };
  return <View style={{ position: "absolute", left: 20, right: 20, bottom: insets.bottom + 12, height: 72, borderRadius: 30, backgroundColor: colors.surface,
    padding: 8, flexDirection: "row", gap: 8, shadowColor: "#000000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 18, elevation: 8 }}>
    {state.routes.map((route, index) => {
      const active = state.index === index; const title = descriptors[route.key]?.options.title ?? route.name;
      const color = active ? "#102015" : colors.muted;
      return <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={title} accessibilityState={{ selected: active }}
        onPress={() => { const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true }); if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params); }}
        onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
        style={{ flex: 1, minHeight: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", gap: 3, backgroundColor: active ? colors.accent : "transparent" }}>
        <Icon name={icons[route.name] ?? "circle"} size={21} color={color} /><Txt style={{ color, fontSize: 12, lineHeight: 17 }}>{title}</Txt>
      </Pressable>;
    })}
  </View>;
}
