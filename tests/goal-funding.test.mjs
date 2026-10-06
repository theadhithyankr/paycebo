import test from "node:test";
import assert from "node:assert/strict";
import { addAllowance, addExpense, addGoal, addTransaction, emptyState, MAX_MONEY, safeToSpend, savedFor, updateBalance } from "../src/lib/model.ts";
import { decodeFundingHints, fundGoal, FundingChangedError, previewGoalFunding } from "../src/lib/goal-funding.ts";
import { SavingsRepository } from "../src/lib/repository.ts";

const now = new Date(2026, 9, 6, 12);
const initial = () => addGoal(emptyState(2000, now), { name: "Laptop", targetPaise: 2000000 }, now, "laptop");
test("set balance and top-up both fund the full contribution without changing the target", () => {
  for (const action of ["set-balance", "top-up"]) {
    const before = initial(); const preview = previewGoalFunding(before, "laptop", 1400000, "Win", now);
    assert.equal(preview.shortfall, 1398000);
    const after = fundGoal(before, preview, action, "Win", now, "payment");
    assert.equal(after.bankBalancePaise, 1400000); assert.equal(savedFor(after, "laptop"), 1400000);
    assert.equal(safeToSpend(after, now), 0); assert.equal(after.goals[0].targetPaise, 2000000);
    assert.equal(after.transactions[0].note, "Win"); assert.equal(before.transactions.length, 0);
  }
});
test("funding preserves existing goal and allowance reservations including a deficit", () => {
  let state = addAllowance(updateBalance(initial(), 100000, now), { name: "Food", amountPaise: 10000, frequency: "daily" }, now, "food");
  state = addTransaction(state, "laptop", "contribution", 5000, "", now, "old");
  state = updateBalance(state, 2000, now);
  const preview = previewGoalFunding(state, "laptop", 1400000, "", now);
  assert.equal(preview.available, -13000); assert.equal(preview.requiredBank, 1415000); assert.equal(preview.shortfall, 1413000);
  const after = fundGoal(state, preview, "top-up", "", now, "new");
  assert.equal(after.transactions.length, 2); assert.equal(after.allowances[0].amountPaise, 10000); assert.equal(safeToSpend(after, now), 0);
});
test("funding validation rejects invalid amounts, notes, target overflow and balance overflow", () => {
  for (const value of [0, -1, 1.5, NaN, MAX_MONEY + 1]) assert.throws(() => previewGoalFunding(initial(), "laptop", value, "", now));
  assert.throws(() => previewGoalFunding(initial(), "laptop", 2000001, "", now), /goal needs/);
  assert.throws(() => previewGoalFunding(initial(), "laptop", 20000, "x".repeat(201), now), /note/);
  let large = addGoal(emptyState(MAX_MONEY, now), { name: "One", targetPaise: MAX_MONEY }, now, "one");
  large = addTransaction(large, "one", "contribution", MAX_MONEY, "", now);
  large = addGoal(large, { name: "Two", targetPaise: 100 }, now, "two");
  assert.throws(() => previewGoalFunding(large, "two", 1, "", now), /supported bank/);
});
test("zero balance and decimal contributions have exact paise arithmetic", () => {
  const state = updateBalance(initial(), 0, now); const p = previewGoalFunding(state, "laptop", 1400001, "", now);
  assert.equal(p.shortfall, 1400001); assert.equal(fundGoal(state, p, "top-up", "", now).bankBalancePaise, 1400001);
});
test("changed balances and allowance periods require renewed confirmation", () => {
  const before = initial(); const p = previewGoalFunding(before, "laptop", 1400000, "", now);
  assert.throws(() => fundGoal(updateBalance(before, 3000, now), p, "top-up", "", now), FundingChangedError);
  let daily = addAllowance(updateBalance(initial(), 100000, now), { name: "Food", amountPaise: 10000, frequency: "daily" }, now, "food");
  daily = addExpense(daily, "food", 6000, "", false, now);
  const dp = previewGoalFunding(daily, "laptop", 400000, "", now);
  assert.throws(() => fundGoal(daily, dp, "top-up", "", new Date(2026, 9, 7, 12)), FundingChangedError);
  const same = fundGoal(daily, dp, "top-up", "", now);
  assert.equal(safeToSpend(same, now), 0);
  assert.throws(() => fundGoal(same, dp, "top-up", "", now), FundingChangedError);
});
test("atomic repository failure applies neither funding nor contribution and retry writes once", async () => {
  const values = new Map(); let fail = false; let writes = 0;
  const repo = new SavingsRepository({ getItem: async key => values.get(key) ?? null, setItem: async (key, value) => { if (fail) throw new Error("disk full"); values.set(key, value); writes++; } });
  const original = await repo.activate("personal", initial); const p = previewGoalFunding(original, "laptop", 1400000, "", now);
  const previousWrites = writes; fail = true;
  await assert.rejects(repo.update(current => fundGoal(current, p, "top-up", "", now, "tx"), "personal"), /disk full/);
  assert.equal(repo.snapshot.bankBalancePaise, 2000); assert.equal(repo.snapshot.transactions.length, 0);
  fail = false; await repo.update(current => fundGoal(current, p, "top-up", "", now, "tx"), "personal");
  assert.equal(writes, previousWrites + 1); assert.equal(repo.snapshot.transactions.length, 1);
  await assert.rejects(repo.update(current => fundGoal(current, p, "top-up", "", now, "tx"), "personal"));
});
test("explanation preferences default on and preserve a stored off choice", () => {
  assert.equal(decodeFundingHints(null), true); assert.equal(decodeFundingHints("false"), false);
  assert.equal(decodeFundingHints("true"), true); assert.throws(() => decodeFundingHints("{}")); assert.throws(() => decodeFundingHints("bad"));
});
