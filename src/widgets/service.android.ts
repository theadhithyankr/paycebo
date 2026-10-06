import { TurboModuleRegistry } from "react-native";
import { WIDGET_NAMES, type WidgetFamily } from "../lib/widget-model";

export function widgetsAvailable(): boolean { return TurboModuleRegistry.get("AndroidWidget") !== null; }
export async function refreshWidgets(): Promise<void> {
  if (!widgetsAvailable()) return;
  const native = await import("./native.android"); await native.updateAllWidgets();
}
export async function pinWidget(family: string): Promise<boolean> {
  if (!widgetsAvailable() || !(family in WIDGET_NAMES)) return false;
  const { requestPinWidget } = await import("react-native-android-widget");
  return requestPinWidget({ widgetName: WIDGET_NAMES[family as WidgetFamily] });
}
