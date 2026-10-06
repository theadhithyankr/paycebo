import { addTransaction, goalById, MAX_MONEY, safeToSpend, savedFor, totalAllowanceReserved, totalSaved, updateBalance, type SavingsState } from "./model.ts";

export interface FundingPreview {
  goalId: string;
  amount: number;
  bank: number;
  reserved: number;
  available: number;
  remaining: number;
  requiredBank: number;
  shortfall: number;
}
export type FundingAction = "set-balance" | "top-up";
export function previewGoalFunding(state: SavingsState, goalId: string, amount: number, note = "", now = new Date()): FundingPreview {
  const goal = goalById(state, goalId);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_MONEY) throw new Error("Enter a valid amount above ₹0.");
  if (note.trim().length > 200) throw new Error("Keep your note to 200 characters.");
  const remaining = goal.targetPaise - savedFor(state, goalId);
  if (amount > remaining) throw new Error("This is more than the goal needs. Choose a smaller amount or edit the target.");
  const reserved = totalSaved(state) + totalAllowanceReserved(state, now);
  const requiredBank = reserved + amount;
  if (!Number.isSafeInteger(requiredBank) || requiredBank > MAX_MONEY) throw new Error("This funding update exceeds the supported bank balance. Choose a smaller amount.");
  return { goalId, amount, bank: state.bankBalancePaise, reserved, available: safeToSpend(state, now), remaining,
    requiredBank, shortfall: Math.max(0, requiredBank - state.bankBalancePaise) };
}
export class FundingChangedError extends Error {
  preview: FundingPreview;
  constructor(preview: FundingPreview) {
    super("Your available funds changed. Review the updated amounts before saving.");
    this.preview = preview;
  }
}
export function fundGoal(state: SavingsState, expected: FundingPreview, action: FundingAction, note = "", now = new Date(), transactionId?: string): SavingsState {
  if (action !== "set-balance" && action !== "top-up") throw new Error("Choose how to update your tracked balance.");
  const latest = previewGoalFunding(state, expected.goalId, expected.amount, note, now);
  if (JSON.stringify(latest) !== JSON.stringify(expected)) throw new FundingChangedError(latest);
  if (latest.shortfall <= 0) throw new FundingChangedError(latest);
  const balance = action === "set-balance" ? latest.requiredBank : latest.bank + latest.shortfall;
  return addTransaction(updateBalance(state, balance, now), latest.goalId, "contribution", latest.amount, note, now, transactionId);
}

export const FUNDING_HINTS_KEY = "paycebo:funding-hints:v1";
export function decodeFundingHints(raw: string | null): boolean {
  if (raw === null) return true;
  const value: unknown = JSON.parse(raw);
  if (typeof value !== "boolean") throw new Error("Saved explanation preferences could not be read. Explanations are on.");
  return value;
}
