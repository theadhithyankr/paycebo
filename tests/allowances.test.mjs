import test from "node:test";
import assert from "node:assert/strict";
import { addAllowance, addExpense, addGoal, addTransaction, allowanceRemaining, allowanceSpent, archiveAllowance, decodeState, editAllowance, editGoal, emptyState, periodStart, safeToSpend, totalAllowanceReserved, updateBalance } from "../src/lib/model.ts";
import { SavingsRepository, STORAGE_KEYS } from "../src/lib/repository.ts";

const now = new Date(2026, 9, 6, 12);
const food = (frequency = "daily", balance = 100000) => addAllowance(emptyState(balance, now), { name: "Food", amountPaise: 10000, frequency }, now, "food");

test("allowance expense reduces the bank balance and releases reservation exactly once", () => {
  let state = food();
  assert.equal(safeToSpend(state, now), 90000);
  state = addExpense(state, "food", 3000, "Lunch", false, now, "lunch");
  assert.equal(state.bankBalancePaise, 97000);
  assert.equal(allowanceRemaining(state, state.allowances[0], now), 7000);
  assert.equal(safeToSpend(state, now), 90000);
  assert.deepEqual(decodeState(JSON.stringify(state)), state);
});
test("savings contributions respect allowance reservations", () => {
  const state = addGoal(food(), { name: "Trip", targetPaise: 100000 }, now, "trip");
  assert.throws(() => addTransaction(state, "trip", "contribution", 91000, "", now), /Safe to Spend/);
  assert.equal(safeToSpend(addTransaction(state, "trip", "contribution", 90000, "", now), now), 0);
});
test("over-budget spending requires confirmation and reports the actual expense", () => {
  assert.throws(() => addExpense(food(), "food", 15000, "", false, now), /Confirm/);
  const state = addExpense(food(), "food", 15000, "", true, now);
  assert.equal(state.bankBalancePaise, 85000);
  assert.equal(allowanceSpent(state, state.allowances[0], now), 15000);
  assert.equal(allowanceRemaining(state, state.allowances[0], now), 0);
  assert.equal(safeToSpend(state, now), 85000);
});
test("invalid, excessive, duplicate and archived expenses are rejected", () => {
  const state = food();
  for (const amount of [0, -1, 0.1, 100001]) assert.throws(() => addExpense(state, "food", amount, "", true, now));
  assert.throws(() => addExpense(state, "food", 100, "x".repeat(201), true, now));
  const spent = addExpense(state, "food", 100, "", false, now, "same");
  assert.throws(() => addExpense(spent, "food", 100, "", false, now, "same"), /already/);
  assert.throws(() => addExpense(archiveAllowance(spent, "food"), "food", 100, "", true, now), /archived/);
});
test("daily, weekly and monthly reservations reset without rollover or fictitious entries", () => {
  for (const frequency of ["daily", "weekly", "monthly"]) {
    const start = periodStart(frequency, now);
    const before = new Date(start.getTime() - 1000);
    let state = addAllowance(emptyState(100000, before), { name: "Food", amountPaise: 10000, frequency }, before, "food");
    state = addExpense(state, "food", 3000, "", false, before);
    assert.equal(allowanceRemaining(state, state.allowances[0], before), 7000);
    assert.equal(allowanceRemaining(state, state.allowances[0], now), 10000);
    assert.equal(state.expenses.length, 1);
    assert.equal(state.bankBalancePaise, 97000);
  }
});
test("calendar boundaries use local midnight, Monday and the first of the month", () => {
  assert.equal(periodStart("daily", now).getHours(), 0);
  assert.equal(periodStart("weekly", now).getDay(), 1);
  assert.equal(periodStart("monthly", now).getDate(), 1);
  const january = periodStart("weekly", new Date(2027, 0, 1, 12));
  assert.equal(january.getFullYear(), 2026);
  assert.equal(periodStart("monthly", new Date(2026, 11, 31)).getMonth(), 11);
});
test("renewal deficits preserve history and block further savings", () => {
  const before = new Date(2026, 9, 5, 23);
  let state = addAllowance(emptyState(10000, before), { name: "Food", amountPaise: 10000, frequency: "daily" }, before, "food");
  state = addExpense(state, "food", 6000, "", false, before);
  assert.equal(safeToSpend(state, now), -6000);
  assert.equal(allowanceRemaining(state, state.allowances[0], now), 10000);
  state = addGoal(state, { name: "Trip", targetPaise: 10000 }, now, "trip");
  assert.throws(() => addTransaction(state, "trip", "contribution", 1, "", now), /Safe to Spend/);
  assert.equal(addExpense(state, "food", 3000, "", false, now).bankBalancePaise, 1000);
});
test("new and edited reservations cannot worsen a funding deficit", () => {
  assert.throws(() => addAllowance(food(), { name: "Travel", amountPaise: 95000, frequency: "weekly" }, now), /available funds/);
  let state = updateBalance(food(), 5000, now);
  assert.throws(() => editAllowance(state, "food", { name: "Food", amountPaise: 11000, frequency: "daily" }, now), /available funds/);
  state = editAllowance(state, "food", { name: "Food", amountPaise: 5000, frequency: "daily" }, now);
  assert.equal(safeToSpend(state, now), 0);
});
test("frequency edits recompute the current period and preserve expense history", () => {
  let state = food(); const yesterday = new Date(2026, 9, 5, 12);
  state = addExpense(state, "food", 3000, "", false, yesterday);
  assert.equal(allowanceSpent(state, state.allowances[0], now), 0);
  state = editAllowance(state, "food", { name: "Food", amountPaise: 10000, frequency: "monthly" }, now);
  assert.equal(allowanceSpent(state, state.allowances[0], now), 3000);
  assert.equal(state.expenses.length, 1);
});
test("archiving releases only the remaining reservation and retains expenses", () => {
  const spent = addExpense(food(), "food", 3000, "", false, now);
  const archived = archiveAllowance(spent, "food");
  assert.equal(totalAllowanceReserved(archived, now), 0);
  assert.equal(safeToSpend(archived, now), 97000);
  assert.deepEqual(archived.expenses, spent.expenses);
});
test("v1 snapshots migrate without changing amounts or histories", async () => {
  const state = addGoal(emptyState(100000, now), { name: "Old goal", targetPaise: 50000, color: "#EDB780" }, now, "old");
  const legacy = { ...state, version: 1 }; delete legacy.allowances; delete legacy.expenses;
  const raw = JSON.stringify(legacy);
  assert.deepEqual(decodeState(raw), state);
  const values = new Map([[STORAGE_KEYS.personal, raw], [STORAGE_KEYS.mode, "personal"]]);
  const repo = new SavingsRepository({ async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { values.set(key, value); } });
  await repo.restore();
  assert.equal(values.get(STORAGE_KEYS.personal), raw);
  await repo.update((current) => addAllowance(current, { name: "Food", amountPaise: 10000, frequency: "daily" }, now), "personal");
  assert.equal(JSON.parse(values.get(STORAGE_KEYS.personal)).version, 2);
});
test("invalid allowance, expense, and photo records are protected from overwrite", () => {
  const state = addExpense(food(), "food", 3000, "", false, now);
  for (const change of [
    { allowances: [{ ...state.allowances[0], frequency: "yearly" }] },
    { expenses: [{ ...state.expenses[0], allowanceId: "unknown" }] },
    { expenses: [...state.expenses, state.expenses[0]] },
    { allowances: [{ ...state.allowances[0], photoId: "../private.jpg" }] },
    { allowances: undefined },
  ]) assert.throws(() => decodeState(JSON.stringify({ ...state, ...change })), /kept untouched/);
});
test("owned photo references round-trip and can be removed without widening URL validation", () => {
  let state = addGoal(emptyState(100000), { name: "Photo", targetPaise: 10000, photoId: "local-photo.jpg" }, now, "photo");
  assert.deepEqual(decodeState(JSON.stringify(state)), state);
  state = editGoal(state, "photo", { name: "Photo", targetPaise: 10000 });
  assert.equal(state.goals[0].photoId, undefined);
  assert.throws(() => addGoal(state, { name: "Bad", targetPaise: 10000, imageUrl: "file:///private.jpg" }));
});
test("concurrent expense saves and failures retain the latest committed balance", async () => {
  const values = new Map(); let fail = false;
  const repo = new SavingsRepository({ async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { if (fail) throw new Error("full"); values.set(key, value); } });
  await repo.activate("personal", () => food());
  await Promise.all([repo.update((s) => addExpense(s, "food", 3000, "", false, now, "one"), "personal"), repo.update((s) => addExpense(s, "food", 4000, "", false, now, "two"), "personal")]);
  assert.equal(repo.snapshot.bankBalancePaise, 93000);
  const before = repo.snapshot; fail = true;
  await assert.rejects(repo.update((s) => addExpense(s, "food", 1000, "", false, now), "personal"));
  assert.equal(repo.snapshot, before);
});
