import { allowanceRemaining, allowanceSpent, money, progressFor, safeToSpend, savedFor, totalAllowanceReserved, totalSaved, type SavingsState } from "./model.ts";

export const WIDGET_CONFIG_KEY = "paycebo:widgets:v1";
export const WIDGET_NAMES = { balance: "PayceboBalance", goal: "PayceboGoal", allowance: "PayceboAllowance" } as const;
export type WidgetFamily = keyof typeof WIDGET_NAMES;
export interface WidgetConfig { family: WidgetFamily; entityId?: string; showAmounts: boolean }
export interface WidgetConfigs { version: 1; instances: Record<string, WidgetConfig> }
export interface WidgetViewModel {
  family: WidgetFamily; title: string; value: string; detail: string; progress: number; updated: string;
  uri: string; status: "ready" | "setup" | "missing" | "error"; accessibilityLabel: string;
  metrics?: { label: string; value: string }[];
}
export function decodeWidgetConfigs(raw: string | null): WidgetConfigs {
  if (!raw) return { version: 1, instances: {} };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1 || !("instances" in value)
    || !value.instances || typeof value.instances !== "object" || Array.isArray(value.instances)) throw new Error("Widget configuration couldn’t be read. Configure the widget again.");
  for (const [id, config] of Object.entries(value.instances)) {
    if (!/^\d+$/.test(id) || !config || typeof config !== "object" || !("family" in config) || !Object.keys(WIDGET_NAMES).includes(config.family)
      || typeof config.showAmounts !== "boolean" || (config.entityId !== undefined && (typeof config.entityId !== "string" || config.entityId.length > 200))) throw new Error("Widget configuration couldn’t be read. Configure the widget again.");
  }
  return value as WidgetConfigs;
}
export function widgetPlaceholder(family: WidgetFamily, status: WidgetViewModel["status"], detail: string): WidgetViewModel {
  return { family, title: "Paycebo", value: status === "setup" ? "Set up Paycebo" : "Open Paycebo", detail, progress: 0, updated: "", uri: "paycebo://widgets", status,
    accessibilityLabel: "Paycebo. " + detail };
}
export function makeWidgetViewModel(state: SavingsState | null, config: WidgetConfig, now = new Date()): WidgetViewModel {
  if (!state) return widgetPlaceholder(config.family, "setup", "Create your personal savings space first.");
  const amount = (value: number) => config.showAmounts ? money(value) : "₹••••";
  const updated = "Updated " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const route = (family: WidgetFamily, id?: string) => "paycebo://widget-link?family=" + family + (id ? "&id=" + encodeURIComponent(id) : "");
  if (config.family === "balance") {
    const metrics = [{ label: "Bank", value: amount(state.bankBalancePaise) }, { label: "Saved", value: amount(totalSaved(state)) }, { label: "Allowance left", value: amount(totalAllowanceReserved(state, now)) }];
    return { family: "balance", title: "Safe to Spend", value: amount(safeToSpend(state, now)), detail: "Your personal balance", progress: 0, updated, metrics,
      uri: route("balance"), status: "ready", accessibilityLabel: "Safe to Spend " + (config.showAmounts ? amount(safeToSpend(state, now)) + ". " + metrics.map(item => `${item.label} ${item.value}`).join(". ") : "amounts hidden") };
  }
  if (config.family === "goal") {
    const goal = state.goals.find(item => item.id === config.entityId);
    if (!goal) return widgetPlaceholder("goal", "missing", "Choose a savings goal in widget settings.");
    const progress = progressFor(state, goal);
    const detail = config.showAmounts ? `${money(savedFor(state, goal.id))} of ${money(goal.targetPaise)}` : "Amounts hidden";
    return { family: "goal", title: goal.name, value: Math.round(progress * 100) + "%", detail, progress, updated, uri: route("goal", goal.id), status: "ready", accessibilityLabel: `${goal.name}. ${Math.round(progress * 100)} percent saved. ${detail}` };
  }
  const allowance = state.allowances.find(item => item.id === config.entityId && !item.archived);
  if (!allowance) return widgetPlaceholder("allowance", "missing", "Choose an active allowance in widget settings.");
  const spent = allowanceSpent(state, allowance, now); const over = Math.max(0, spent - allowance.amountPaise);
  const value = amount(over || allowanceRemaining(state, allowance, now));
  const detail = `${over > 0 ? "Over budget" : "Left"} · ${allowance.frequency === "daily" ? "Today" : allowance.frequency === "weekly" ? "This week" : "This month"}`;
  return { family: "allowance", title: allowance.name, value, detail, progress: Math.min(1, spent / allowance.amountPaise), updated, uri: route("allowance", allowance.id), status: "ready",
    accessibilityLabel: `${allowance.name}. ${config.showAmounts ? value : "Amount hidden"}. ${detail}` };
}
