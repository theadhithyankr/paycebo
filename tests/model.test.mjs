import test from "node:test";
import assert from "node:assert/strict";
import {
  addGoal, addTransaction, decodeState, editGoal, emptyState, generateReminders,
  inputMoney, money, parseMoney, progressFor, safeToSpend, savedFor, totalSaved,
  updateBalance, weekStart, weeklyRemaining, withdrawalCopy,
} from "../src/lib/model.ts";
import { demoState } from "../src/lib/demo.ts";

const monday = new Date(2026, 9, 5, 12);
const friday = new Date(2026, 9, 9, 12);
function fixture() {
  return addGoal(emptyState(100_000, monday), {
    name: "Headset", targetPaise: 50_000, weeklyPaise: 20_000, dueDay: 5,
  }, monday, "headset");
}

test("money input stays exact in paise, including fractions and zero balances", () => {
  assert.equal(parseMoney("100.01"), 10001);
  assert.equal(parseMoney(" 0.05 "), 5);
  assert.equal(parseMoney("0", true), 0);
  assert.equal(parseMoney("999999999.99"), 99_999_999_999);
  assert.equal(inputMoney(10001), "100.01");
  assert.equal(inputMoney(10000), "100");
  for (const input of ["0", "-1", "1e3", "1.001", "NaN", "", "1,000", "Infinity", "1000000000", ".5"]) {
    assert.throws(() => parseMoney(input));
  }
});

test("currency uses Indian grouping and preserves fractional rupees", () => {
  assert.match(money(12_345_678), /1,23,456\.78/);
  assert.match(money(-50000), /500/);
  assert.match(money(50), /0\.50/);
});

test("payment allocates without reducing bank balance twice", () => {
  const before = fixture();
  const after = addTransaction(before, "headset", "contribution", 20_000, "Skipped pizza", monday, "t1");
  assert.equal(savedFor(after, "headset"), 20_000);
  assert.equal(totalSaved(after), 20_000);
  assert.equal(safeToSpend(after), 80_000);
  assert.equal(after.bankBalancePaise, before.bankBalancePaise);
  assert.equal(before.transactions.length, 0);
  assert.equal(progressFor(after, after.goals[0]), 0.4);
});

test("full withdrawal releases the allocation and leaves bank balance alone", () => {
  let state = addTransaction(fixture(), "headset", "contribution", 20_000, "", monday, "t1");
  state = addTransaction(state, "headset", "withdrawal", 20_000, "", friday, "t2");
  assert.equal(savedFor(state, "headset"), 0);
  assert.equal(safeToSpend(state), 100_000);
  assert.equal(state.bankBalancePaise, 100_000);
  assert.equal(progressFor(state, state.goals[0]), 0);
});

test("invalid amounts, duplicates, insufficient funds, overfunding, and unavailable goals are rejected", () => {
  const state = fixture();
  assert.throws(() => addTransaction(state, "unknown", "contribution", 1));
  for (const amount of [0, -1, NaN, 0.5, Infinity]) assert.throws(() => addTransaction(state, "headset", "contribution", amount));
  assert.throws(() => addTransaction(state, "headset", "contribution", 50_001));
  assert.throws(() => addTransaction(updateBalance(state, 1), "headset", "contribution", 2));
  assert.throws(() => addTransaction(state, "headset", "withdrawal", 1));
  const saved = addTransaction(state, "headset", "contribution", 1, "", monday, "t1");
  assert.throws(() => addTransaction(saved, "headset", "contribution", 1, "", monday, "t1"));
  assert.throws(() => addTransaction(state, "headset", "contribution", 1, "x".repeat(201)));
});

test("balance reconciliation preserves goals even when availability goes negative", () => {
  let state = addTransaction(fixture(), "headset", "contribution", 40_000);
  state = updateBalance(state, 10_000);
  assert.equal(safeToSpend(state), -30_000);
  assert.equal(savedFor(state, "headset"), 40_000);
  assert.throws(() => addTransaction(state, "headset", "contribution", 1));
  state = addTransaction(state, "headset", "withdrawal", 35_000);
  assert.equal(safeToSpend(state), 5_000);
});

test("editing preserves goal identity and cannot lower target below savings", () => {
  const saved = addTransaction(fixture(), "headset", "contribution", 20_000);
  assert.throws(() => editGoal(saved, "headset", { name: "New", targetPaise: 19_999 }));
  const updated = editGoal(saved, "headset", { name: " New Headset ", targetPaise: 60_000, weeklyPaise: 0 });
  assert.equal(updated.goals[0].name, "New Headset");
  assert.equal(updated.goals[0].createdAt, saved.goals[0].createdAt);
  assert.equal(updated.goals[0].weeklyPaise, 0);
  assert.equal(savedFor(updated, "headset"), 20_000);
});

test("lowering a target after a withdrawal preserves valid historical payments", () => {
  let state = addTransaction(fixture(), "headset", "contribution", 40_000);
  state = addTransaction(state, "headset", "withdrawal", 10_000);
  state = editGoal(state, "headset", { name: "Headset", targetPaise: 30_000 });
  assert.deepEqual(decodeState(JSON.stringify(state)), state);
  assert.equal(progressFor(state, state.goals[0]), 1);
});

test("goal validation accepts only usable names, amounts, weekdays, colors, and image links", () => {
  for (const input of [
    { name: "", targetPaise: 1 }, { name: "x".repeat(61), targetPaise: 1 },
    { name: "Goal", targetPaise: 0 }, { name: "Goal", targetPaise: 1, weeklyPaise: -1 },
    { name: "Goal", targetPaise: 1, dueDay: 0 }, { name: "Goal", targetPaise: 1, dueDay: 8 },
    { name: "Goal", targetPaise: 1, imageUrl: "javascript:alert(1)" },
    { name: "Goal", targetPaise: 1, color: "invalid" },
  ]) assert.throws(() => addGoal(emptyState(), input));
});

test("weekly pledge uses Monday boundaries and net payments, including withdrawals", () => {
  let state = fixture();
  state = addTransaction(state, "headset", "contribution", 10_000, "", new Date(2026, 9, 4, 23, 59), "old");
  state = addTransaction(state, "headset", "contribution", 8_000, "", monday, "new");
  state = addTransaction(state, "headset", "withdrawal", 3_000, "", friday, "back");
  assert.equal(weeklyRemaining(state, state.goals[0], friday), 15_000);
  assert.equal(weekStart(new Date(2026, 9, 11)).getDate(), 5);
  assert.equal(weekStart(new Date(2026, 9, 12)).getDate(), 12);
});

test("reminders start on due day, persist once per week, and roll to a new Monday", () => {
  const state = fixture();
  assert.equal(generateReminders(state, monday), state);
  const first = generateReminders(state, friday);
  assert.equal(first.reminders.length, 1);
  assert.match(first.reminders[0].text, /200/);
  assert.equal(generateReminders(first, friday), first);
  assert.equal(generateReminders(first, new Date(2026, 9, 11, 12)), first);
  assert.equal(generateReminders(first, new Date(2026, 9, 16, 12)).reminders.length, 2);
  const restored = decodeState(JSON.stringify(first));
  assert.equal(generateReminders(restored, friday).reminders.length, 1);
});

test("weekly pledges cap requests at the remaining target", () => {
  const state = addTransaction(fixture(), "headset", "contribution", 45_000, "", new Date(2026, 9, 1), "old");
  assert.equal(weeklyRemaining(state, state.goals[0], friday), 5_000);
});

test("completed, pledge-met, and reminder-disabled goals receive no messages", () => {
  const complete = addTransaction(fixture(), "headset", "contribution", 50_000, "", monday);
  assert.equal(generateReminders(complete, friday), complete);
  const met = addTransaction(fixture(), "headset", "contribution", 20_000, "", monday);
  assert.equal(generateReminders(met, friday), met);
  const off = editGoal(fixture(), "headset", { name: "Headset", targetPaise: 50_000, weeklyPaise: 0 });
  assert.equal(generateReminders(off, friday), off);
});

test("supportive tone changes new copy without rewriting historical reminders", () => {
  const first = generateReminders(fixture(), friday);
  const supportive = { ...first, tone: "supportive" };
  const next = generateReminders(supportive, new Date(2026, 9, 16));
  assert.equal(next.reminders[0].text, first.reminders[0].text);
  assert.match(next.reminders[1].text, /works for you/);
  const saved = addTransaction(supportive, "headset", "contribution", 5_000);
  assert.doesNotMatch(withdrawalCopy(saved, saved.goals[0], 1_000), /disappointed/);
  assert.match(withdrawalCopy({ ...saved, tone: "playful" }, saved.goals[0], 1_000), /disappointed/);
});

test("valid snapshots, including demo history, round-trip without balance drift", () => {
  const demo = demoState(monday);
  assert.deepEqual(decodeState(JSON.stringify(demo)), demo);
  assert.equal(totalSaved(demo), 2_300_000);
  assert.equal(safeToSpend(demo), 2_550_000);
});

test("invalid and future snapshots are rejected rather than reset", () => {
  assert.throws(() => decodeState("{broken"));
  assert.throws(() => decodeState(JSON.stringify({ ...fixture(), version: 2 })));
  assert.throws(() => decodeState(JSON.stringify({ ...fixture(), bankBalancePaise: -1 })));
  assert.throws(() => decodeState(JSON.stringify({ ...fixture(), goals: [{ ...fixture().goals[0], imageUrl: 12 }] })));
  const paid = addTransaction(fixture(), "headset", "contribution", 100, "", monday, "t1");
  for (const mutation of [
    { transactions: [...paid.transactions, paid.transactions[0]] },
    { transactions: [{ ...paid.transactions[0], goalId: "missing" }] },
    { transactions: [{ ...paid.transactions[0], kind: "withdrawal" }] },
    { transactions: [{ ...paid.transactions[0], createdAt: "bad date" }] },
  ]) assert.throws(() => decodeState(JSON.stringify({ ...paid, ...mutation })));
  const reminded = generateReminders(fixture(), friday);
  assert.throws(() => decodeState(JSON.stringify({ ...reminded, reminders: [...reminded.reminders, reminded.reminders[0]] })));
});
