export type Tone = "playful" | "supportive";
export type Mode = "personal" | "demo";
export type TransactionKind = "contribution" | "withdrawal";

export interface Goal {
  id: string;
  name: string;
  targetPaise: number;
  imageUrl: string;
  photoId?: string;
  color: string;
  weeklyPaise: number;
  dueDay: number; // ISO weekday, Monday = 1 and Sunday = 7.
  createdAt: string;
}

export interface Transaction {
  id: string;
  goalId: string;
  kind: TransactionKind;
  amountPaise: number; // Always positive; kind determines the ledger sign.
  note: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  goalId: string;
  weekKey: string;
  text: string;
  createdAt: string;
}

export interface SavingsState {
  version: 2;
  bankBalancePaise: number;
  balanceUpdatedAt: string;
  tone: Tone;
  goals: Goal[];
  transactions: Transaction[];
  reminders: Reminder[];
  allowances: Allowance[];
  expenses: Expense[];
}

export type Frequency = "daily" | "weekly" | "monthly";
export interface Allowance {
  id: string;
  name: string;
  amountPaise: number;
  frequency: Frequency;
  color: string;
  imageUrl: string;
  photoId?: string;
  createdAt: string;
  archived: boolean;
}
export interface Expense {
  id: string;
  allowanceId: string;
  amountPaise: number;
  note: string;
  createdAt: string;
}
export type AllowanceInput = Pick<Allowance, "name" | "amountPaise" | "frequency"> & Partial<Pick<Allowance, "color" | "imageUrl" | "photoId">>;

export interface GoalInput {
  name: string;
  targetPaise: number;
  imageUrl?: string;
  photoId?: string;
  color?: string;
  weeklyPaise?: number;
  dueDay?: number;
}

export const COLORS = ["#398332", "#497BAC", "#31795B", "#8060A5", "#B25C64", "#EDB780", "#B5C5E8", "#A9D6B2", "#D5B8E8", "#E9B7B0"] as const;
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const MAX_MONEY = 99_999_999_999;

export function createId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 11);
}

export function money(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

export function inputMoney(paise: number): string {
  return (paise / 100).toFixed(paise % 100 === 0 ? 0 : 2);
}

export function parseMoney(input: string, allowZero = false): number {
  const cleaned = input.trim();
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("Enter a rupee amount with up to two decimal places.");
  }
  const [whole = "0", fraction = ""] = cleaned.split(".");
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  assertMoney(paise, allowZero);
  return paise;
}

function assertMoney(value: number, allowZero = false): void {
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1) || value > MAX_MONEY) {
    throw new Error(allowZero ? "Enter a balance between ₹0 and ₹99,99,99,999.99." : "Enter an amount above ₹0 and below ₹1 billion.");
  }
}

export function emptyState(bankBalancePaise = 0, now = new Date()): SavingsState {
  assertMoney(bankBalancePaise, true);
  return { version: 2, bankBalancePaise, balanceUpdatedAt: now.toISOString(), tone: "playful", goals: [], transactions: [], reminders: [], allowances: [], expenses: [] };
}

export function savedFor(state: SavingsState, goalId: string): number {
  return state.transactions.reduce((total, tx) =>
    tx.goalId === goalId ? total + (tx.kind === "contribution" ? tx.amountPaise : -tx.amountPaise) : total, 0);
}

export function totalSaved(state: SavingsState): number {
  return state.transactions.reduce((total, tx) => total + (tx.kind === "contribution" ? tx.amountPaise : -tx.amountPaise), 0);
}

export function safeToSpend(state: SavingsState, now = new Date()): number {
  return state.bankBalancePaise - totalSaved(state) - totalAllowanceReserved(state, now);
}

export function progressFor(state: SavingsState, goal: Goal): number {
  return Math.min(1, Math.max(0, savedFor(state, goal.id) / goal.targetPaise));
}

export function goalById(state: SavingsState, id: string): Goal {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) throw new Error("This goal is no longer available. Return home and choose another.");
  return goal;
}

function goalValues(input: GoalInput, color: string): Omit<Goal, "id" | "createdAt"> {
  const name = input.name.trim();
  if (!name || name.length > 60) throw new Error("Give your goal a name between 1 and 60 characters.");
  assertMoney(input.targetPaise);
  const weeklyPaise = input.weeklyPaise ?? 0;
  assertMoney(weeklyPaise, true);
  const dueDay = input.dueDay ?? 5;
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 7) throw new Error("Choose a due weekday.");
  const imageUrl = (input.imageUrl ?? "").trim();
  if (imageUrl) {
    try {
      const url = new URL(imageUrl);
      if (url.protocol !== "https:" || !url.hostname || imageUrl.length > 2048) throw new Error();
    } catch { throw new Error("Use an https image URL, or leave it empty for initials."); }
  }
  if (!COLORS.includes(color as typeof COLORS[number])) throw new Error("Choose one of the goal colors.");
  validatePhotoId(input.photoId);
  return { name, targetPaise: input.targetPaise, weeklyPaise, dueDay, imageUrl, color, ...(input.photoId ? { photoId: input.photoId } : {}) };
}

export function addGoal(state: SavingsState, input: GoalInput, now = new Date(), id = createId()): SavingsState {
  if (state.goals.some((goal) => goal.id === id)) throw new Error("Please try saving this goal again.");
  const values = goalValues(input, input.color ?? COLORS[state.goals.length % COLORS.length]!);
  return { ...state, goals: [...state.goals, { ...values, id, createdAt: now.toISOString() }] };
}

export function editGoal(state: SavingsState, id: string, input: GoalInput): SavingsState {
  const goal = goalById(state, id);
  const values = goalValues(input, input.color ?? goal.color);
  if (values.targetPaise < savedFor(state, id)) throw new Error("The target cannot be lower than what you have saved. Request money back first.");
  const next = { ...goal, ...values };
  if (!input.photoId) delete next.photoId;
  return { ...state, goals: state.goals.map((item) => item.id === id ? next : item) };
}

export function updateBalance(state: SavingsState, balance: number, now = new Date()): SavingsState {
  assertMoney(balance, true);
  return { ...state, bankBalancePaise: balance, balanceUpdatedAt: now.toISOString() };
}

export function addTransaction(
  state: SavingsState, goalId: string, kind: TransactionKind, amountPaise: number,
  note = "", now = new Date(), id = createId(),
): SavingsState {
  const goal = goalById(state, goalId);
  assertMoney(amountPaise);
  if (kind !== "contribution" && kind !== "withdrawal") throw new Error("Choose Pay or Request Money.");
  if (state.transactions.some((tx) => tx.id === id)) throw new Error("This payment was already recorded.");
  if (note.trim().length > 200) throw new Error("Keep your note to 200 characters.");
  const saved = savedFor(state, goalId);
  if (kind === "contribution") {
    if (amountPaise > safeToSpend(state, now)) throw new Error("This exceeds your Safe to Spend balance. Update your balance or choose a smaller amount.");
    if (amountPaise > goal.targetPaise - saved) throw new Error("This is more than the goal needs. Choose a smaller amount or edit the target.");
  } else if (amountPaise > saved) throw new Error("You can only request money already saved in this goal.");
  return { ...state, transactions: [...state.transactions, { id, goalId, kind, amountPaise, note: note.trim(), createdAt: now.toISOString() }] };
}

export function weekStart(now: Date): Date {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function localDateKey(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function weeklyRemaining(state: SavingsState, goal: Goal, now = new Date()): number {
  const monday = weekStart(now).getTime();
  const net = state.transactions.reduce((total, tx) => {
    const time = new Date(tx.createdAt).getTime();
    if (tx.goalId !== goal.id || time < monday || time > now.getTime()) return total;
    return total + (tx.kind === "contribution" ? tx.amountPaise : -tx.amountPaise);
  }, 0);
  return Math.min(goal.targetPaise - savedFor(state, goal.id), Math.max(0, goal.weeklyPaise - net));
}

export function generateReminders(state: SavingsState, now = new Date()): SavingsState {
  const weekKey = localDateKey(weekStart(now));
  const isoDay = now.getDay() === 0 ? 7 : now.getDay();
  const reminders = [...state.reminders];
  for (const goal of state.goals) {
    if (!goal.weeklyPaise || isoDay < goal.dueDay) continue;
    if (reminders.some((item) => item.goalId === goal.id && item.weekKey === weekKey)) continue;
    const remaining = weeklyRemaining(state, goal, now);
    if (remaining <= 0) continue;
    const dueName = WEEKDAYS[goal.dueDay - 1]!;
    const text = state.tone === "playful"
      ? "Hey, you still owe me " + money(remaining) + " this week for our " + dueName + " pledge. Future you says thanks."
      : "You have " + money(remaining) + " left toward this week’s " + dueName + " pledge. Save when it works for you.";
    reminders.push({ id: "reminder-" + goal.id + "-" + weekKey, goalId: goal.id, weekKey, text, createdAt: now.toISOString() });
  }
  return reminders.length === state.reminders.length ? state : { ...state, reminders };
}

export function withdrawalCopy(state: SavingsState, goal: Goal, amount: number): string {
  if (state.tone === "playful") {
    return "Are you sure you want to take " + money(amount) + " back? The " + goal.name + " is disappointed. Your money, your call.";
  }
  return "Taking " + money(amount) + " back will reduce your progress to " + money(savedFor(state, goal.id) - amount) + ". It’s okay to adjust your plans.";
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function validId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200;
}

export function validatePhotoId(value: unknown): void {
  if (value !== undefined && (typeof value !== "string" || !/^[a-z0-9-]{1,100}\.jpg$/.test(value))) throw new Error("That photo reference is invalid. Choose the photo again.");
}

export function periodStart(frequency: Frequency, now: Date): Date {
  if (frequency === "weekly") return weekStart(now);
  const date = new Date(now); date.setHours(0, 0, 0, 0);
  if (frequency === "monthly") date.setDate(1);
  return date;
}
export function allowanceSpent(state: SavingsState, allowance: Allowance, now = new Date()): number {
  const start = periodStart(allowance.frequency, now).getTime();
  return state.expenses.reduce((sum, expense) => expense.allowanceId === allowance.id && Date.parse(expense.createdAt) >= start && Date.parse(expense.createdAt) <= now.getTime() ? sum + expense.amountPaise : sum, 0);
}
export function allowanceRemaining(state: SavingsState, allowance: Allowance, now = new Date()): number {
  return allowance.archived ? 0 : Math.max(0, allowance.amountPaise - allowanceSpent(state, allowance, now));
}
export function totalAllowanceReserved(state: SavingsState, now = new Date()): number {
  return state.allowances.reduce((sum, allowance) => sum + allowanceRemaining(state, allowance, now), 0);
}
function allowanceValues(input: AllowanceInput, color: string) {
  // Share appearance validation with savings goals; retain the established legacy palette.
  const appearance = goalValues({ name: input.name, targetPaise: input.amountPaise, imageUrl: input.imageUrl, photoId: input.photoId }, color);
  if (!["daily", "weekly", "monthly"].includes(input.frequency)) throw new Error("Choose daily, weekly, or monthly.");
  return { name: appearance.name, amountPaise: input.amountPaise, frequency: input.frequency, color: appearance.color, imageUrl: appearance.imageUrl, ...(appearance.photoId ? { photoId: appearance.photoId } : {}) };
}
function validateReservation(before: SavingsState, after: SavingsState, now: Date) {
  if (safeToSpend(after, now) < Math.min(0, safeToSpend(before, now))) throw new Error("This allowance exceeds your available funds. Choose a smaller amount or update your balance.");
  return after;
}
export function addAllowance(state: SavingsState, input: AllowanceInput, now = new Date(), id = createId()): SavingsState {
  if (state.allowances.some((item) => item.id === id)) throw new Error("This allowance already exists.");
  const allowance = { ...allowanceValues(input, input.color ?? COLORS[0]), id, createdAt: now.toISOString(), archived: false };
  return validateReservation(state, { ...state, allowances: [...state.allowances, allowance] }, now);
}
export function allowanceById(state: SavingsState, id: string): Allowance {
  const allowance = state.allowances.find((item) => item.id === id);
  if (!allowance) throw new Error("This allowance is unavailable. Return home and choose another.");
  return allowance;
}
export function editAllowance(state: SavingsState, id: string, input: AllowanceInput, now = new Date()): SavingsState {
  const current = allowanceById(state, id);
  if (current.archived) throw new Error("This allowance has been archived.");
  const next = { ...current, ...allowanceValues(input, input.color ?? current.color) };
  if (!input.photoId) delete next.photoId;
  return validateReservation(state, { ...state, allowances: state.allowances.map((item) => item.id === id ? next : item) }, now);
}
export function archiveAllowance(state: SavingsState, id: string): SavingsState {
  allowanceById(state, id);
  return { ...state, allowances: state.allowances.map((item) => item.id === id ? { ...item, archived: true } : item) };
}
export function addExpense(state: SavingsState, allowanceId: string, amountPaise: number, note = "", confirmOverspend = false, now = new Date(), id = createId()): SavingsState {
  const allowance = allowanceById(state, allowanceId);
  if (allowance.archived) throw new Error("This allowance has been archived.");
  assertMoney(amountPaise);
  if (state.expenses.some((item) => item.id === id)) throw new Error("This expense was already recorded.");
  if (amountPaise > state.bankBalancePaise) throw new Error("This exceeds your tracked bank balance. Update your balance first.");
  if (note.trim().length > 200) throw new Error("Keep your note to 200 characters.");
  if (amountPaise > allowanceRemaining(state, allowance, now) && !confirmOverspend) throw new Error("Confirm this over-budget expense before recording it.");
  return { ...state, bankBalancePaise: state.bankBalancePaise - amountPaise, balanceUpdatedAt: now.toISOString(),
    expenses: [...state.expenses, { id, allowanceId, amountPaise, note: note.trim(), createdAt: now.toISOString() }] };
}

/** Reject unknown/corrupt snapshots rather than silently overwriting personal data. */
export function decodeState(raw: string): SavingsState {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error("Your saved data could not be read. It has been kept untouched."); }
  if (!record(value) || (value.version !== 1 && value.version !== 2) || !validDate(value.balanceUpdatedAt)
    || (value.tone !== "playful" && value.tone !== "supportive")
    || !Array.isArray(value.goals) || !Array.isArray(value.transactions) || !Array.isArray(value.reminders)) {
    throw new Error("Your saved data uses an unsupported or unreadable format. It has been kept untouched.");
  }
  if (value.version === 1) value = { ...value, version: 2, allowances: [], expenses: [] };
  if (!record(value) || !Array.isArray(value.goals) || !Array.isArray(value.transactions) || !Array.isArray(value.reminders) || !Array.isArray(value.allowances) || !Array.isArray(value.expenses)) throw new Error("Your saved allowances could not be read. Your data has been kept untouched.");
  try {
    assertMoney(value.bankBalancePaise as number, true);
    const goals = new Map<string, Goal>();
    for (const item of value.goals) {
      if (!record(item) || !validId(item.id) || !validDate(item.createdAt)
        || typeof item.name !== "string" || typeof item.imageUrl !== "string" || typeof item.color !== "string"
        || typeof item.targetPaise !== "number" || typeof item.weeklyPaise !== "number" || typeof item.dueDay !== "number"
        || goals.has(item.id)) throw new Error();
      goalValues(item as unknown as GoalInput, item.color);
      goals.set(item.id, item as unknown as Goal);
    }
    const ids = new Set<string>();
    const balances = new Map<string, number>();
    for (const tx of value.transactions) {
      if (!record(tx) || !validId(tx.id) || ids.has(tx.id) || typeof tx.goalId !== "string" || !goals.has(tx.goalId)
        || (tx.kind !== "contribution" && tx.kind !== "withdrawal")
        || typeof tx.note !== "string" || tx.note.length > 200 || !validDate(tx.createdAt)) throw new Error();
      assertMoney(tx.amountPaise as number);
      const saved = (balances.get(tx.goalId) ?? 0) + (tx.kind === "contribution" ? 1 : -1) * (tx.amountPaise as number);
      if (!Number.isSafeInteger(saved) || saved < 0 || saved > MAX_MONEY) throw new Error();
      balances.set(tx.goalId, saved);
      ids.add(tx.id);
    }
    // Current targets can be lowered after withdrawals; historical funded amounts remain valid.
    for (const [goalId, saved] of balances) {
      if (saved > goals.get(goalId)!.targetPaise) throw new Error();
    }
    const reminderKeys = new Set<string>();
    for (const reminder of value.reminders) {
      if (!record(reminder) || !validId(reminder.id) || ids.has(reminder.id)
        || typeof reminder.goalId !== "string" || !goals.has(reminder.goalId)
        || typeof reminder.weekKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(reminder.weekKey)
        || typeof reminder.text !== "string" || reminder.text.length > 1000 || !validDate(reminder.createdAt)) throw new Error();
      const key = reminder.goalId + ":" + reminder.weekKey;
      if (reminderKeys.has(key)) throw new Error();
      reminderKeys.add(key);
      ids.add(reminder.id);
    }
    const allowances = new Set<string>();
    for (const item of value.allowances) {
      if (!record(item) || !validId(item.id) || allowances.has(item.id) || !validDate(item.createdAt) || typeof item.archived !== "boolean"
        || typeof item.name !== "string" || typeof item.amountPaise !== "number" || typeof item.color !== "string" || typeof item.imageUrl !== "string") throw new Error();
      allowanceValues(item as unknown as AllowanceInput, item.color);
      allowances.add(item.id);
    }
    for (const expense of value.expenses) {
      if (!record(expense) || !validId(expense.id) || ids.has(expense.id) || typeof expense.allowanceId !== "string" || !allowances.has(expense.allowanceId)
        || !validDate(expense.createdAt) || typeof expense.note !== "string" || expense.note.length > 200) throw new Error();
      assertMoney(expense.amountPaise as number); ids.add(expense.id);
    }
    const state = value as unknown as SavingsState;
    if (!Number.isSafeInteger(totalSaved(state)) || !Number.isSafeInteger(totalAllowanceReserved(state)) || !Number.isSafeInteger(state.expenses.reduce((sum, item) => sum + item.amountPaise, 0))) throw new Error();
    return state;
  } catch { throw new Error("Your saved data contains invalid records. It has been kept untouched."); }
}
