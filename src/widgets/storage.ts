import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeState, type SavingsState } from "../lib/model";
import { STORAGE_KEYS } from "../lib/repository";
import { decodeWidgetConfigs, WIDGET_CONFIG_KEY, type WidgetConfig } from "../lib/widget-model";

export async function readPersonalSnapshot(): Promise<SavingsState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.personal); return raw ? decodeState(raw) : null;
}
export async function readWidgetConfigs() { return decodeWidgetConfigs(await AsyncStorage.getItem(WIDGET_CONFIG_KEY)); }
let writes: Promise<unknown> = Promise.resolve();
export function saveWidgetConfig(id: number, config?: WidgetConfig): Promise<void> {
  const result = writes.then(async () => {
    const current = await readWidgetConfigs();
    if (config) current.instances[String(id)] = config; else delete current.instances[String(id)];
    await AsyncStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(current));
  });
  writes = result.catch(() => {}); return result;
}
export function resetWidgetConfigs(): Promise<void> {
  const result = writes.then(() => AsyncStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify({ version: 1, instances: {} })));
  writes = result.catch(() => {}); return result;
}
