import { addGoal, addTransaction, emptyState, parseMoney, type GoalInput, type SavingsState } from "./model.ts";
import type { StorageAdapter } from "./repository.ts";

export const ONBOARDING_KEY = "paycebo:onboarding:v1";
export interface OnboardingDraft {
  version: 1;
  step: number;
  name: string;
  target: string;
  balance: string;
  allocation: string;
}
export function freshDraft(): OnboardingDraft {
  return { version: 1, step: 0, name: "", target: "", balance: "", allocation: "" };
}

export function stepError(draft: OnboardingDraft, step: number): string {
  try {
    if (step === 0) {
      if (!draft.name.trim() || draft.name.trim().length > 60) return "Give your goal a name between 1 and 60 characters.";
    } else if (step === 1) parseMoney(draft.target);
    else if (step === 2) parseMoney(draft.balance, true);
    else if (step === 3) {
      const value = parseMoney(draft.allocation);
      if (value > parseMoney(draft.balance, true)) return "Choose an amount within your bank balance, or save later.";
      if (value > parseMoney(draft.target)) return "Your goal needs less than that. Choose a smaller amount.";
    }
    return "";
  } catch (error) { return error instanceof Error ? error.message : "Check this amount and try again."; }
}

export function decodeDraft(raw: string | null): OnboardingDraft | null {
  if (raw === null || raw === "null") return null;
  let value: OnboardingDraft;
  try { value = JSON.parse(raw); } catch { throw new Error("Your unfinished setup couldn’t be read. You can restart setup; your saved savings will stay untouched."); }
  if (!value || value.version !== 1 || !Number.isInteger(value.step) || value.step < 0 || value.step > 3
    || typeof value.name !== "string" || value.name.length > 60
    || [value.target, value.balance, value.allocation].some((input) => typeof input !== "string" || input.length > 12)) {
    throw new Error("Your unfinished setup couldn’t be read. You can restart setup; your saved savings will stay untouched.");
  }
  // A resumed step must have valid prerequisites; unfinished current input is allowed.
  for (let step = 0; step < value.step; step++) {
    if (stepError(value, step)) return { ...value, step };
  }
  return value;
}

/** Separate queued writes keep a delayed keystroke from overwriting newer answers. */
export class OnboardingDraftStore {
  private queue: Promise<unknown> = Promise.resolve();
  private storage: StorageAdapter;
  constructor(storage: StorageAdapter) { this.storage = storage; }
  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(task);
    this.queue = result.catch(() => {});
    return result;
  }
  read(): Promise<OnboardingDraft | null> {
    return this.enqueue(async () => decodeDraft(await this.storage.getItem(ONBOARDING_KEY)));
  }
  save(draft: OnboardingDraft): Promise<void> {
    const raw = JSON.stringify(draft);
    return this.enqueue(() => this.storage.setItem(ONBOARDING_KEY, raw));
  }
  clear(): Promise<void> {
    return this.enqueue(() => this.storage.setItem(ONBOARDING_KEY, "null"));
  }
}

export function createPersonalState(balance: number, firstGoal?: GoalInput, initialContribution?: number): SavingsState {
  let next = emptyState(balance);
  if (firstGoal) next = addGoal(next, firstGoal);
  if (initialContribution !== undefined) {
    const goal = next.goals[0];
    if (!goal) throw new Error("Choose a goal before recording your first saving.");
    next = addTransaction(next, goal.id, "contribution", initialContribution);
  }
  return next;
}
