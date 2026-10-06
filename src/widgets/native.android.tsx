import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWidgetInfo, requestWidgetUpdateById, type WidgetInfo, type WidgetTaskHandlerProps } from "react-native-android-widget";
import { APPEARANCE_KEY, decodeAppearance } from "../lib/appearance";
import { makeWidgetViewModel, widgetPlaceholder, WIDGET_NAMES, type WidgetFamily } from "../lib/widget-model";
import { readPersonalSnapshot, readWidgetConfigs, saveWidgetConfig } from "./storage";
import { widgetRepresentation } from "./render.android";

export function familyForName(name: string): WidgetFamily {
  const family = (Object.keys(WIDGET_NAMES) as WidgetFamily[]).find(key => WIDGET_NAMES[key] === name);
  if (!family) throw new Error("Unknown widget family."); return family;
}
export async function representationFor(info: WidgetInfo) {
  const family = familyForName(info.widgetName);
  try {
    const [state, configs, rawAppearance] = await Promise.all([readPersonalSnapshot(), readWidgetConfigs(), AsyncStorage.getItem(APPEARANCE_KEY)]);
    const config = configs.instances[String(info.widgetId)];
    const model = config ? makeWidgetViewModel(state, config) : widgetPlaceholder(family, "setup", "Finish adding this widget in widget settings.");
    return widgetRepresentation(model, decodeAppearance(rawAppearance), info.width);
  } catch { return widgetRepresentation(widgetPlaceholder(family, "error", "Open Paycebo to check your saved data."), "system", info.width); }
}
let updates: Promise<unknown> = Promise.resolve();
export function updateAllWidgets(): Promise<void> {
  const next = updates.then(async () => {
    for (const widgetName of Object.values(WIDGET_NAMES)) {
      const instances = await getWidgetInfo(widgetName);
      for (const info of instances) await requestWidgetUpdateById({ widgetName, widgetId: info.widgetId, renderWidget: () => representationFor(info) });
    }
  }); updates = next.catch(() => {}); return next;
}
export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  if (props.widgetAction === "WIDGET_DELETED") { await saveWidgetConfig(props.widgetInfo.widgetId); return; }
  if (props.widgetAction === "WIDGET_ADDED") {
    try {
    const configs = await readWidgetConfigs();
    if (!configs.instances[String(props.widgetInfo.widgetId)]) {
      const state = await readPersonalSnapshot();
      const family = familyForName(props.widgetInfo.widgetName);
      const entityId = family === "goal" ? state?.goals[0]?.id : family === "allowance" ? state?.allowances.find(item => !item.archived)?.id : undefined;
      // Pinning does not open configuration on every launcher. Start with the
      // same personal item shown in the app preview; each instance is editable.
      if (state && (family === "balance" || entityId)) await saveWidgetConfig(props.widgetInfo.widgetId, { family, entityId, showAmounts: true });
    }
    } catch { /* Render the preserved-data error below if preferences cannot be read or saved. */ }
  }
  props.renderWidget(await representationFor(props.widgetInfo));
}
