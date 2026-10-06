import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Switch, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts } from "expo-font";
import { Manrope_400Regular, Manrope_700Bold } from "@expo-google-fonts/manrope";
import { WidgetPreview, type WidgetConfigurationScreenProps } from "react-native-android-widget";
import { AppearanceProvider, useAppTheme } from "../state/AppearanceProvider";
import { FontContext, Button, Display, ErrorNotice, Txt } from "../components/ui";
import { makeWidgetViewModel, type WidgetConfig } from "../lib/widget-model";
import type { SavingsState } from "../lib/model";
import { readPersonalSnapshot, readWidgetConfigs, resetWidgetConfigs, saveWidgetConfig } from "./storage";
import { familyForName } from "./native.android";
import { widgetRepresentation } from "./render.android";

function Configuration(props: WidgetConfigurationScreenProps) {
  const { colors, preference, mode, ready } = useAppTheme(); const family = familyForName(props.widgetInfo.widgetName);
  const [state, setState] = useState<SavingsState | null>(null); const [loading, setLoading] = useState(true);
  const [entityId, setEntityId] = useState<string>(); const [showAmounts, setShowAmounts] = useState(true);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const lock = useRef(false);
  const [configError, setConfigError] = useState(false);
  const [loaded, fontError] = useFonts({ Manrope_400Regular, Manrope_700Bold });
  useEffect(() => {
    let active = true;
    void Promise.allSettled([readPersonalSnapshot(), readWidgetConfigs()]).then(([snapshot, configs]) => {
      if (!active) return;
      if (snapshot.status === "fulfilled") setState(snapshot.value); else setError("Personal savings couldn’t be read. Open Paycebo to recover them.");
      if (configs.status === "rejected") { setConfigError(true); setError("Widget preferences couldn’t be read. Retry adding the widget or reset only widget settings below."); return; }
      const existing = configs.value.instances[String(props.widgetInfo.widgetId)]; setEntityId(existing?.entityId); setShowAmounts(existing?.showAmounts ?? true);
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : "Couldn’t read personal data."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [props.widgetInfo.widgetId]);
  const choices = family === "goal" ? state?.goals ?? [] : state?.allowances.filter(item => !item.archived) ?? [];
  const config: WidgetConfig = { family, entityId, showAmounts };
  async function save() {
    if (lock.current) return; lock.current = true; setBusy(true); setError("");
    try {
      const latest = await readPersonalSnapshot(); const model = makeWidgetViewModel(latest, config);
      if (model.status !== "ready") throw new Error("Choose an available personal goal or allowance first.");
      await saveWidgetConfig(props.widgetInfo.widgetId, config);
      props.renderWidget(widgetRepresentation(model, preference, props.widgetInfo.width)); props.setResult("ok");
    } catch (err) { setError(err instanceof Error ? err.message : "Couldn’t save this widget. Try again."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <FontContext.Provider value={loaded}><SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">
      <Display style={{ fontSize: 28 }}>Your {family} widget</Display>
      {loading || !ready || (!loaded && !fontError) ? <ActivityIndicator color={colors.accent} /> : <>
        {state ? <WidgetPreview renderWidget={() => { const representation = widgetRepresentation(makeWidgetViewModel(state, config), mode, props.widgetInfo.width); return "light" in representation ? representation.light : representation; }} width={Math.min(props.widgetInfo.width, 320)} height={Math.min(props.widgetInfo.height, 220)} /> : <Txt>Create your personal savings space before adding widgets.</Txt>}
        {family !== "balance" ? choices.map(item => <Pressable key={item.id} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: item.id === entityId, disabled: busy }} onPress={() => setEntityId(item.id)} style={{ padding: 16, minHeight: 52, borderRadius: 16, backgroundColor: item.id === entityId ? colors.accent : colors.surface }}><Txt style={{ color: item.id === entityId ? "#102015" : colors.foreground }}>{item.name}</Txt></Pressable>) : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 }}><Txt>Show amounts</Txt><Switch accessibilityLabel="Show widget amounts" disabled={busy} value={showAmounts} onValueChange={setShowAmounts} trackColor={{ false: colors.line, true: colors.accent }} /></View>
        <ErrorNotice message={error} />
        {configError ? <Button label="Reset widget settings" variant="danger" onPress={() => Alert.alert("Reset widget settings?", "Existing widgets will need configuring again. Your savings and expenses stay intact.", [
          { text: "Cancel", style: "cancel" }, { text: "Reset widgets", style: "destructive", onPress: () => { void resetWidgetConfigs().then(() => { setConfigError(false); setError(""); }).catch(() => setError("Widget settings couldn’t be reset. Free some storage and retry.")); } },
        ])} /> : null}
        <Button label="Save widget" loading={busy} disabled={configError || !state || (family !== "balance" && !entityId)} onPress={() => void save()} />
        {!state ? <Button label="Open Paycebo" variant="secondary" onPress={() => { props.setResult("cancel"); void Linking.openURL("paycebo://widget-link?family=balance"); }} /> : null}
        <Button label="Cancel" variant="ghost" disabled={busy} onPress={() => props.setResult("cancel")} />
      </>}
    </ScrollView>
  </SafeAreaView></FontContext.Provider>;
}
export function WidgetConfigurationScreen(props: WidgetConfigurationScreenProps) {
  return <SafeAreaProvider><AppearanceProvider><KeyboardProvider><Configuration {...props} /></KeyboardProvider></AppearanceProvider></SafeAreaProvider>;
}
