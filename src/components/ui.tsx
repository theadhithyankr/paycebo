import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { createContext, useContext } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type TextInputProps, type TextProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cssInterop, vars } from "nativewind";
import Svg, { Path } from "react-native-svg";
import { useSavings } from "../state/SavingsProvider";
import { UIAction, UIInput, UIDialog, UISheet } from "./primitives";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useIsFocused } from "@react-navigation/native";
import { useAppTheme } from "../state/AppearanceProvider";
import { lightPalette, paletteVariables } from "../lib/appearance";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// Safe-area views are third-party native components, so map utility classes explicitly.
cssInterop(SafeAreaView, { className: "style" });

export const palette = lightPalette;
export const FontContext = createContext(false);
export type IconName = React.ComponentProps<typeof Feather>["name"];

export function Txt({ className = "", style, ...props }: TextProps & { className?: string }) {
  const loaded = useContext(FontContext);
  return <Text {...props} className={"text-foreground text-base " + className} style={[{ fontSize: 16, lineHeight: 24, fontFamily: loaded ? "Manrope_400Regular" : undefined }, style]} />;
}
export function Display({ className = "", style, ...props }: TextProps & { className?: string }) {
  const loaded = useContext(FontContext);
  return <Text {...props} className={"text-foreground " + className} style={[{
    fontFamily: loaded ? "Manrope_700Bold" : undefined, fontWeight: "700",
    fontSize: 30, lineHeight: 38, letterSpacing: -0.5,
  }, style]} />;
}
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) {
  const { colors } = useAppTheme();
  return <Feather name={name} size={size} color={color ?? colors.foreground} accessible={false} />;
}
export function Mark({ size = 28, color = palette.accent }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32" accessible={Platform.OS === "web" ? undefined : false} aria-hidden={true}><Path d="M8 28V6h8a9 9 0 0 1 0 18h-4M8 15h8a3 3 0 0 1 0 6h-4" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
export function Button({ label, onPress, variant = "primary", disabled = false, loading = false, icon, dark = false }: {
  label: string; onPress: () => void; variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean; loading?: boolean; icon?: IconName; dark?: boolean;
}) {
  const { colors: palette } = useAppTheme();
  const color = variant === "primary" ? "#102015" : variant === "danger" ? palette.danger : dark ? palette.onDark : palette.foreground;
  const backgrounds = { primary: "bg-accent", secondary: "bg-elevated", ghost: "bg-transparent", danger: "bg-danger-surface" };
  return <UIAction accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || loading, busy: loading }}
    isDisabled={disabled || loading} onPress={onPress} className={"min-h-[52px] rounded-2xl px-5 py-3 flex-row items-center justify-center gap-2 active:opacity-75 " + backgrounds[variant]}
    style={{ opacity: disabled ? 0.45 : 1 }}>
    {loading ? <ActivityIndicator color={color} /> : icon ? <Icon name={icon} color={color} size={18} /> : null}
    <Txt style={{ color, fontWeight: "600", textAlign: "center", flexShrink: 1 }}>{loading ? "Saving…" : label}</Txt>
  </UIAction>;
}
export function IconButton({ name, label, onPress, disabled = false, color }: { name: IconName; label: string; onPress: () => void; disabled?: boolean; color?: string }) {
  const { colors: palette } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} onPress={onPress} disabled={disabled}
    className="h-12 w-12 rounded-full items-center justify-center" style={({ pressed }) => ({ backgroundColor: pressed ? palette.elevated : "transparent", opacity: disabled ? 0.4 : 1 })}>
    <Icon name={name} color={color} />
  </Pressable>;
}
export function Field({ label, hint, style, ...props }: TextInputProps & { label: string; hint?: string }) {
  const { colors: palette } = useAppTheme();
  return <View className="gap-2">
    <Txt className="font-medium">{label}</Txt>
    <UIInput isDisabled={props.editable === false}>
      <UIInput.Input {...props} aria-label={label} accessibilityLabel={label} placeholderTextColor={palette.muted} selectionColor={palette.accent}
        className="rounded-2xl bg-elevated px-4 py-4 text-foreground" style={[{ minHeight: 56, fontSize: 17, lineHeight: 24 }, style]} />
    </UIInput>
    {hint ? <Txt className="text-muted" style={{ fontSize: 13, lineHeight: 19 }}>{hint}</Txt> : null}
  </View>;
}
export function ErrorNotice({ message }: { message?: string | null }) {
  const { colors: palette } = useAppTheme();
  if (!message) return null;
  return <View className="rounded-2xl bg-danger-surface p-4" accessibilityLiveRegion="polite" accessibilityRole="alert"><Txt style={{ color: palette.danger }}>{message}</Txt></View>;
}
export function Notice({ children }: { children: React.ReactNode }) {
  const { colors: palette } = useAppTheme();
  return <View className="rounded-2xl bg-surface p-4 flex-row gap-3"><Icon name="info" color={palette.muted} /><Txt className="text-muted flex-1" style={{ fontSize: 14, lineHeight: 21 }}>{children}</Txt></View>;
}
export function Page({ children, scroll = true, padded = true, dark = false, dock = false }: { children: React.ReactNode; scroll?: boolean; padded?: boolean; dark?: boolean; dock?: boolean }) {
  const { colors: palette, mode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  return <SafeAreaView className="flex-1" style={{ backgroundColor: dark ? palette.dark : palette.background }} edges={["top", "left", "right"]}>
    {focused ? <StatusBar style={dark || mode === "dark" ? "light" : "dark"} /> : null}
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingHorizontal: padded ? 24 : 0, paddingBottom: dock ? 100 + insets.bottom : 28 + insets.bottom, flexGrow: 1 }}
      style={{ backgroundColor: dark && !dock ? palette.dark : palette.background }} className="flex-1" showsVerticalScrollIndicator={false}>{children}</ScrollView> : children}
  </SafeAreaView>;
}
export function FormPage({ title, children, busy = false, footer }: { title: string; children: React.ReactNode; busy?: boolean; footer?: React.ReactNode }) {
  const { colors: palette, mode } = useAppTheme();
  const [footerHeight, setFooterHeight] = React.useState(0);
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  return <SafeAreaView className="flex-1 bg-background">
    {focused ? <StatusBar style={mode === "dark" ? "light" : "dark"} /> : null}
    <View className="flex-1">
      <View className="flex-row justify-between items-center px-5 py-3">
        <Display style={{ fontSize: 26, lineHeight: 34, flex: 1 }}>{title}</Display>
        <IconButton name="x" label="Close" disabled={busy} onPress={() => router.canGoBack() ? router.back() : router.replace("/")} />
      </View>
      <KeyboardAwareScrollView style={{ flex: 1 }} bottomOffset={footerHeight + 16} extraKeyboardSpace={footerHeight} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: footerHeight + 40 }} showsVerticalScrollIndicator={false}>{children}</KeyboardAwareScrollView>
      {footer ? <KeyboardStickyView offset={{ opened: insets.bottom }} onLayout={(event) => setFooterHeight(event.nativeEvent.layout.height)} className="px-6 pt-3 pb-3 bg-background">{footer}</KeyboardStickyView> : null}
    </View>
  </SafeAreaView>;
}
export function DemoBanner() {
  const { colors: palette } = useAppTheme();
  const { mode } = useSavings();
  if (mode !== "demo") return null;
  return <View className="flex-row items-center justify-between bg-contribution rounded-xl px-3 py-1 mb-4">
    <Txt style={{ color: palette.accentText, fontSize: 13 }}>Demo · sample money</Txt>
    <Pressable accessibilityRole="button" accessibilityLabel="Set up personal savings" className="min-h-[48px] justify-center px-2" onPress={() => router.push("/setup")}><Txt style={{ color: palette.accentText, fontSize: 13, fontWeight: "600" }}>Make it yours <Icon name="arrow-up-right" size={13} color={palette.accentText} /></Txt></Pressable>
  </View>;
}

export function ActionSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { colors: palette } = useAppTheme();
  const insets = useSafeAreaInsets();
  return <UISheet isOpen={open} onClose={onClose} useRNModal={Platform.OS !== "web"} style={[vars(paletteVariables(palette)), { flex: 1, justifyContent: "flex-end" }]}>
    <UISheet.Backdrop style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(11,23,17,0.55)" }} />
    <UISheet.Content style={{ marginTop: "auto", backgroundColor: palette.surface, padding: 24, paddingBottom: 24 + insets.bottom, borderTopLeftRadius: 28, borderTopRightRadius: 28, width: "100%", gap: 12 }}>
      <Display style={{ fontSize: 24, lineHeight: 32 }}>{title}</Display>
      {children}
      <Button label="Cancel" variant="ghost" onPress={onClose} />
    </UISheet.Content>
  </UISheet>;
}
export function ConfirmDialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const { colors: palette } = useAppTheme();
  return <UIDialog isOpen={open} onClose={onClose} useRNModal={Platform.OS !== "web"} style={[vars(paletteVariables(palette)), { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }]}>
    <UIDialog.Backdrop style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(11,23,17,0.55)" }} />
    <UIDialog.Content style={{ maxWidth: 440, width: "100%", maxHeight: "85%", backgroundColor: palette.surface, borderRadius: 24 }}>
      <UIDialog.Body contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Display style={{ fontSize: 25 }}>{title}</Display>{children}
      </UIDialog.Body>
    </UIDialog.Content>
  </UIDialog>;
}
export function Empty({ icon = "sun", title, description, action }: { icon?: IconName; title: string; description: string; action?: React.ReactNode }) {
  const { colors: palette } = useAppTheme();
  return <View className="py-10 gap-4 items-center">
    <View className="h-16 w-16 bg-surface rounded-full items-center justify-center"><Icon name={icon} size={26} color={palette.accent} /></View>
    <Display style={{ fontSize: 26, textAlign: "center" }}>{title}</Display>
    <Txt className="text-muted" style={{ textAlign: "center", maxWidth: 330 }}>{description}</Txt>
    {action ? <View className="self-stretch mt-2">{action}</View> : null}
  </View>;
}
