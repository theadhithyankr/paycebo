import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Appearance, Platform, View } from "react-native";
import { colorScheme, vars } from "nativewind";
import * as SystemUI from "expo-system-ui";
import { APPEARANCE_KEY, darkPalette, decodeAppearance, lightPalette, paletteVariables, resolveAppearance, type AppearancePreference, type Palette } from "../lib/appearance";
import { refreshWidgets } from "../widgets/service";

interface AppearanceValue {
  preference: AppearancePreference;
  mode: "light" | "dark";
  colors: Palette;
  ready: boolean;
  busy: boolean;
  error: string;
  setPreference: (preference: AppearancePreference) => Promise<void>;
}
const AppearanceContext = createContext<AppearanceValue | null>(null);
export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<AppearancePreference>("system");
  const [device, setDevice] = useState(() => Appearance.getColorScheme());
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(APPEARANCE_KEY).then((raw) => { if (active) setPreferenceState(decodeAppearance(raw)); })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : "Couldn’t read appearance. Using System."); })
      .finally(() => { if (active) setReady(true); });
    const subscription = Appearance.addChangeListener(({ colorScheme: next }) => setDevice(next));
    return () => { active = false; subscription.remove(); };
  }, []);
  const mode = resolveAppearance(preference, device);
  const colors = mode === "dark" ? darkPalette : lightPalette;
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [mode, colors.background]);
  useEffect(() => {
    if (ready) { colorScheme.set(preference); if (Platform.OS !== "web") Appearance.setColorScheme(preference === "system" ? "unspecified" : preference); }
  }, [preference, ready]);
  async function setPreference(next: AppearancePreference) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
      setPreferenceState(next); void refreshWidgets().catch(() => {});
    } catch { setError("Appearance couldn’t be saved. Your previous choice is still active. Try again."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <AppearanceContext.Provider value={{ preference, mode, colors, ready, busy, error, setPreference }}><View style={[{ flex: 1 }, vars(paletteVariables(colors))]}>{children}</View></AppearanceContext.Provider>;
}
export function useAppTheme() { const value = useContext(AppearanceContext); if (!value) throw new Error("AppearanceProvider is missing."); return value; }
export function ThemeScope({ children, style }: { children: React.ReactNode; style?: React.ComponentProps<typeof View>["style"] }) {
  const { colors } = useAppTheme(); return <View style={[vars(paletteVariables(colors)), style]}>{children}</View>;
}
