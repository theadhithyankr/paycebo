import test from "node:test";
import assert from "node:assert/strict";
import { addGoal, addTransaction, emptyState, savedFor, updateBalance } from "../src/lib/model.ts";
import { demoState } from "../src/lib/demo.ts";
import { SavingsRepository, STORAGE_KEYS } from "../src/lib/repository.ts";

function storage() {
  const values = new Map();
  return {
    values, failKey: null,
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) {
      if (this.failKey === key) throw new Error("storage full");
      await new Promise((resolve) => setTimeout(resolve, 1));
      values.set(key, value);
    },
  };
}
function fixture() { return addGoal(emptyState(100000), { name: "Headset", targetPaise: 50000 }, new Date(), "headset"); }

test("fresh storage does not create or assume a session", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.restore();
  assert.equal(repo.snapshot, null);
  assert.equal(repo.mode, null);
  assert.equal(disk.values.size, 0);
});

test("activation and restart persist balance, goals, tone, and transaction history", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.activate("personal", fixture);
  await repo.update((state) => ({ ...addTransaction(state, "headset", "contribution", 5000), tone: "supportive" }), "personal");
  const restored = new SavingsRepository(disk);
  await restored.restore();
  assert.deepEqual(restored.snapshot, repo.snapshot);
  assert.equal(restored.mode, "personal");
});

test("concurrent updates read committed snapshots rather than dropping a payment", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.activate("personal", fixture);
  await Promise.all([
    repo.update((state) => addTransaction(state, "headset", "contribution", 5000, "", new Date(), "one"), "personal"),
    repo.update((state) => addTransaction(state, "headset", "contribution", 7000, "", new Date(), "two"), "personal"),
  ]);
  assert.equal(savedFor(repo.snapshot, "headset"), 12000);
  assert.equal(repo.snapshot.transactions.length, 2);
});

test("concurrent overfunding is rejected against the latest committed state", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.activate("personal", fixture);
  const results = await Promise.allSettled([
    repo.update((state) => addTransaction(state, "headset", "contribution", 30000), "personal"),
    repo.update((state) => addTransaction(state, "headset", "contribution", 30000), "personal"),
  ]);
  assert.equal(results.filter((item) => item.status === "fulfilled").length, 1);
  assert.equal(savedFor(repo.snapshot, "headset"), 30000);
});

test("failed writes neither publish nor mutate state, and a later retry works", async () => {
  const disk = storage(); let publishes = 0;
  const repo = new SavingsRepository(disk, () => publishes++);
  await repo.activate("personal", fixture);
  const before = repo.snapshot;
  const rawBefore = disk.values.get(STORAGE_KEYS.personal);
  disk.failKey = STORAGE_KEYS.personal;
  await assert.rejects(repo.update((state) => addTransaction(state, "headset", "contribution", 5000), "personal"));
  assert.equal(repo.snapshot, before);
  assert.equal(disk.values.get(STORAGE_KEYS.personal), rawBefore);
  assert.equal(publishes, 1);
  disk.failKey = null;
  await repo.update((state) => addTransaction(state, "headset", "contribution", 5000), "personal");
  assert.equal(savedFor(repo.snapshot, "headset"), 5000);
});

test("demo changes are isolated and personal reactivation never overwrites saved data", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.activate("personal", fixture);
  const personal = disk.values.get(STORAGE_KEYS.personal);
  await repo.activate("demo", demoState);
  await repo.update((state) => updateBalance(state, 0), "demo");
  assert.equal(disk.values.get(STORAGE_KEYS.personal), personal);
  await repo.activate("personal", () => { throw new Error("must not recreate existing personal data"); });
  assert.deepEqual(repo.snapshot, fixtureComparable(personal));
  assert.equal(repo.mode, "personal");
});
function fixtureComparable(raw) { return JSON.parse(raw); }

test("a mode-selector write failure does not publish the other session", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.activate("personal", fixture);
  const before = repo.snapshot;
  disk.failKey = STORAGE_KEYS.mode;
  await assert.rejects(repo.activate("demo", demoState));
  assert.equal(repo.mode, "personal");
  assert.equal(repo.snapshot, before);
  assert.equal(disk.values.get(STORAGE_KEYS.mode), "personal");
});

test("stale-session updates cannot write to the newly activated session", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.activate("personal", fixture);
  await repo.activate("demo", demoState);
  const before = disk.values.get(STORAGE_KEYS.demo);
  await assert.rejects(repo.update((state) => updateBalance(state, 0), "personal"), /session changed/);
  assert.equal(disk.values.get(STORAGE_KEYS.demo), before);
});

test("corrupt personal data is never replaced by activation or demo initialization", async () => {
  const disk = storage();
  disk.values.set(STORAGE_KEYS.personal, "{corrupt");
  disk.values.set(STORAGE_KEYS.mode, "personal");
  const repo = new SavingsRepository(disk);
  await assert.rejects(repo.restore(), /kept untouched/);
  await assert.rejects(repo.activate("personal", fixture), /kept untouched/);
  await assert.rejects(repo.hasPersonal(), /kept untouched/);
  assert.equal(disk.values.get(STORAGE_KEYS.personal), "{corrupt");
  assert.equal(repo.snapshot, null);
});

test("missing and unknown persisted session selectors fail without resetting data", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  disk.values.set(STORAGE_KEYS.mode, "demo");
  await assert.rejects(repo.restore(), /missing/);
  disk.values.set(STORAGE_KEYS.mode, "unknown");
  await assert.rejects(repo.restore(), /kept untouched/);
});
