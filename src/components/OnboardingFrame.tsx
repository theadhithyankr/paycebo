import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton, Mark, palette, Txt } from "./ui";
import { StatusBar } from "expo-status-bar";

export function OnboardingFrame({ step, title, children, footer, onBack, busy = false }: {
  step: number; title: string; children: React.ReactNode; footer: React.ReactNode; onBack: () => void; busy?: boolean;
}) {
  const [reduced, setReduced] = useState(true);
  const progress = Math.min(100, (step + 1) * 20);
  const fill = useRef(new Animated.Value(progress)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (alive) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => { alive = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const animation = Animated.timing(fill, { toValue: progress, duration: reduced ? 0 : 300, useNativeDriver: false });
    animation.start(); return () => animation.stop();
  }, [progress, fill, reduced]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    AccessibilityInfo.announceForAccessibility(title);
    opacity.setValue(reduced ? 1 : 0.65);
    const animation = Animated.timing(opacity, { toValue: 1, duration: reduced ? 0 : 220, useNativeDriver: Platform.OS !== "web" });
    animation.start(); return () => animation.stop();
  }, [step, title, reduced, opacity]);
  return <SafeAreaView className="flex-1" style={{ backgroundColor: palette.dark }}>
    <StatusBar style="light" />
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View className="px-6 pt-2 pb-5 gap-3" style={{ backgroundColor: palette.dark }}>
        <View className="flex-row items-center justify-between">
          <IconButton name="arrow-left" label={step === 4 ? "Go to my savings" : step === 0 ? "Back to welcome" : "Previous question"} onPress={onBack} disabled={busy} color={palette.onDark} />
          <View className="flex-row items-center gap-2"><Mark size={22} /><Txt style={{ fontWeight: "600", fontSize: 18, color: palette.onDark }}>paycebo</Txt></View>
          <View style={{ width: 48 }} />
        </View>
        <View accessible accessibilityRole="progressbar" accessibilityLabel="Setup progress" accessibilityValue={{ min: 0, max: 100, now: progress }}
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}
          style={{ height: 6, borderRadius: 8, backgroundColor: "#FFFFFF20", overflow: "hidden" }}>
          <Animated.View style={{ height: 6, borderRadius: 8, backgroundColor: palette.accent,
            width: fill.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }} />
        </View>
        <View className="flex-row justify-between gap-3">
          <Txt style={{ fontSize: 13, color: palette.darkMuted }}>Setup</Txt>
          <Txt style={{ fontSize: 13, color: palette.accent }}>{progress}%</Txt>
        </View>
      </View>
      <ScrollView ref={scroll} className="flex-1" keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 36, paddingBottom: 24, flexGrow: 1 }}>
        <Animated.View style={{ opacity, flex: 1, gap: 24 }}>{children}</Animated.View>
      </ScrollView>
      <View className="px-6 pt-4 pb-3 gap-2 border-t border-line">{footer}</View>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
