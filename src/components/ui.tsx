import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { createContext, useContext } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type TextInputProps, type TextProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cssInterop } from "nativewind";
import Svg, { Path } from "react-native-svg";
import { useSavings } from "../state/SavingsProvider";

// Safe-area views are third-party native components, so map utility classes explicitly.
cssInterop(SafeAreaView, { className: "style" });

export const palette = {
  background: "#0B0B0C", surface: "#181819", elevated: "#222223", foreground: "#F5F2EC",
  muted: "#B2AFA9", accent: "#EDB780", line: "#343332", positive: "#A9D6B2", danger: "#FFB1A5",
};
export const FontContext = createContext(false);
export type IconName = React.ComponentProps<typeof Feather>["name"];

export function Txt({ className = "", style, ...props }: TextProps & { className?: string }) {
  return <Text {...props} className={"text-foreground text-base " + className} style={[{ fontSize: 16, lineHeight: 24 }, style]} />;
}
export function Display({ className = "", style, ...props }: TextProps & { className?: string }) {
  const loaded = useContext(FontContext);
  return <Text {...props} className={"text-foreground " + className} style={[{
    fontFamily: loaded ? "Aleo_400Regular" : Platform.select({ ios: "Georgia", android: "serif", default: "Georgia" }),
    fontSize: 30, lineHeight: 38, letterSpacing: -0.5,
  }, style]} />;
}
export function Icon({ name, size = 20, color = palette.foreground }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color} accessible={false} />;
}
export function Mark({ size = 28, color = palette.accent }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32" accessible={false}><Path d="M8 28V6h8a9 9 0 0 1 0 18h-4M8 15h8a3 3 0 0 1 0 6h-4" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
export function Button({ label, onPress, variant = "primary", disabled = false, loading = false, icon }: {
  label: string; onPress: () => void; variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean; loading?: boolean; icon?: IconName;
}) {
  const color = variant === "primary" ? "#17120D" : variant === "danger" ? palette.danger : palette.foreground;
  const backgrounds = { primary: "bg-accent", secondary: "bg-elevated", ghost: "bg-transparent", danger: "bg-[#35201D]" };
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }}
    disabled={disabled || loading} onPress={onPress} className={"min-h-[52px] rounded-2xl px-5 py-3 flex-row items-center justify-center gap-2 " + backgrounds[variant]}
    style={({ pressed }) => ({ opacity: disabled ? 0.45 : pressed ? 0.75 : 1 })}>
    {loading ? <ActivityIndicator color={color} /> : icon ? <Icon name={icon} color={color} size={18} /> : null}
    <Txt style={{ color, fontWeight: "600", textAlign: "center", flexShrink: 1 }}>{loading ? "Saving…" : label}</Txt>
  </Pressable>;
}
export function IconButton({ name, label, onPress, disabled = false }: { name: IconName; label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled}
    className="h-12 w-12 rounded-full items-center justify-center" style={({ pressed }) => ({ backgroundColor: pressed ? palette.elevated : "transparent", opacity: disabled ? 0.4 : 1 })}>
    <Icon name={name} />
  </Pressable>;
}
export function Field({ label, hint, style, ...props }: TextInputProps & { label: string; hint?: string }) {
  return <View className="gap-2">
    <Txt className="font-medium">{label}</Txt>
    <TextInput {...props} accessibilityLabel={label} placeholderTextColor={palette.muted} selectionColor={palette.accent}
      className="rounded-2xl bg-elevated px-4 py-4 text-foreground" style={[{ minHeight: 56, fontSize: 17, lineHeight: 24 }, style]} />
    {hint ? <Txt className="text-muted" style={{ fontSize: 13, lineHeight: 19 }}>{hint}</Txt> : null}
  </View>;
}
export function ErrorNotice({ message }: { message?: string | null }) {
  if (!message) return null;
  return <View className="rounded-2xl bg-[#35201D] p-4" accessibilityLiveRegion="polite" accessibilityRole="alert"><Txt style={{ color: palette.danger }}>{message}</Txt></View>;
}
export function Notice({ children }: { children: React.ReactNode }) {
  return <View className="rounded-2xl bg-surface p-4 flex-row gap-3"><Icon name="info" color={palette.muted} /><Txt className="text-muted flex-1" style={{ fontSize: 14, lineHeight: 21 }}>{children}</Txt></View>;
}
export function Page({ children, scroll = true, padded = true }: { children: React.ReactNode; scroll?: boolean; padded?: boolean }) {
  return <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingHorizontal: padded ? 24 : 0, paddingBottom: 28, flexGrow: 1 }}
      className="flex-1" showsVerticalScrollIndicator={false}>{children}</ScrollView> : children}
  </SafeAreaView>;
}
export function FormPage({ title, children, busy = false }: { title: string; children: React.ReactNode; busy?: boolean }) {
  return <SafeAreaView className="flex-1 bg-background">
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View className="flex-row justify-between items-center px-5 py-3">
        <Display style={{ fontSize: 26, lineHeight: 34, flex: 1 }}>{title}</Display>
        <IconButton name="x" label="Close" disabled={busy} onPress={() => router.canGoBack() ? router.back() : router.replace("/")} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function DemoBanner() {
  const { mode } = useSavings();
  if (mode !== "demo") return null;
  return <View className="flex-row items-center justify-between bg-[#292119] rounded-xl px-3 py-1 mb-4">
    <Txt className="text-accent" style={{ fontSize: 13 }}>Demo · sample money</Txt>
    <Pressable accessibilityRole="button" accessibilityLabel="Set up personal savings" className="min-h-[48px] justify-center px-2" onPress={() => router.push("/setup")}><Txt className="text-accent" style={{ fontSize: 13, fontWeight: "600" }}>Make it yours <Icon name="arrow-up-right" size={13} color={palette.accent} /></Txt></Pressable>
  </View>;
}
export function Empty({ icon = "sun", title, description, action }: { icon?: IconName; title: string; description: string; action?: React.ReactNode }) {
  return <View className="py-10 gap-4 items-center">
    <View className="h-16 w-16 bg-surface rounded-full items-center justify-center"><Icon name={icon} size={26} color={palette.accent} /></View>
    <Display style={{ fontSize: 26, textAlign: "center" }}>{title}</Display>
    <Txt className="text-muted" style={{ textAlign: "center", maxWidth: 330 }}>{description}</Txt>
    {action ? <View className="self-stretch mt-2">{action}</View> : null}
  </View>;
}
