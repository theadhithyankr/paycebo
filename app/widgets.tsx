import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { Button, Display, ErrorNotice, FormPage, Notice, Txt } from "../src/components/ui";
import { useAppTheme } from "../src/state/AppearanceProvider";
import { pinWidget, widgetsAvailable } from "../src/widgets/service";
import { readPersonalSnapshot } from "../src/widgets/storage";
import { makeWidgetViewModel, type WidgetFamily } from "../src/lib/widget-model";
import type { SavingsState } from "../src/lib/model";

export default function Widgets() {
  const { colors } = useAppTheme(); const [state, setState] = useState<SavingsState | null>(null); const [error, setError] = useState(""); const [info, setInfo] = useState("");
  const [busy, setBusy] = useState<WidgetFamily | null>(null);
  useEffect(() => { void readPersonalSnapshot().then(setState).catch(err => setError(err instanceof Error ? err.message : "Couldn’t read personal savings.")); }, []);
  async function pin(family: WidgetFamily) {
    if (busy) return; setBusy(family); setError(""); setInfo("");
    try { const accepted = await pinWidget(family); setInfo(accepted ? "Confirm in your launcher. To choose another item or hide amounts, long-press the widget and open its settings." : "Long-press an empty area of your home screen, choose Widgets, then Paycebo."); }
    catch { setError("The launcher couldn’t add this widget. Try adding it from your home screen’s Widgets menu."); }
    finally { setBusy(null); }
  }
  return <FormPage title="Home screen widgets">
    <Txt className="text-muted">Your personal savings, one glance away.</Txt>
    {Platform.OS !== "android" ? <Notice>Home screen widgets are available in the Android app.</Notice> : !widgetsAvailable() ? <Notice>Install a fresh Android development or EAS build to use widgets. They aren’t available in Expo Go.</Notice> : null}
    <ErrorNotice message={error} />{info ? <Notice>{info}</Notice> : null}
    {(["balance", "goal", "allowance"] as const).map(family => {
      const entity = family === "goal" ? state?.goals[0] : family === "allowance" ? state?.allowances.find(item => !item.archived) : undefined;
      const model = makeWidgetViewModel(state, { family, entityId: entity?.id, showAmounts: true });
      return <View key={family} style={{ padding: 20, gap: 10, borderRadius: 24, backgroundColor: colors.surface }}>
        <Txt className="font-medium">{family === "balance" ? "Balance summary · 4 × 2" : family === "goal" ? "Savings goal · 2 × 2" : "Allowance · 2 × 2"}</Txt>
        <Display style={{ fontSize: 24 }}>{model.title}</Display><Txt style={{ fontSize: 28, lineHeight: 36, fontWeight: "700" }}>{model.value}</Txt><Txt className="text-muted" style={{ fontSize: 13 }}>{model.detail}</Txt>
        <Button label={"Add " + family + " widget"} disabled={!widgetsAvailable() || busy !== null} onPress={() => void pin(family)} />
      </View>;
    })}
    <Txt className="text-muted" style={{ fontSize: 13 }}>Widgets use personal data even while you explore the demo. Amounts can be hidden during widget configuration. Updates happen after saved changes and on Android’s background schedule.</Txt>
  </FormPage>;
}
