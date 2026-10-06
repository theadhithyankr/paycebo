import test from "node:test";
import assert from "node:assert/strict";
import { createPersonalState, decodeDraft, freshDraft, ONBOARDING_KEY, OnboardingDraftStore, stepError } from "../src/lib/onboarding.ts";
import { decodeState, progressFor, safeToSpend, savedFor } from "../src/lib/model.ts";
import { SavingsRepository, STORAGE_KEYS } from "../src/lib/repository.ts";

function storage() {
  return {
    values: new Map(), failKey: null,
    async getItem(key) { return this.values.get(key) ?? null; },
    async setItem(key, value) {
      if (this.failKey === key) throw new Error("storage full");
      await new Promise((resolve) => setTimeout(resolve, 2));
      this.values.set(key, value);
    },
  };
}
const readyDraft = () => ({ ...freshDraft(), step: 3, name: "Headphones", target: "500", balance: "1000", allocation: "100" });
const create = () => createPersonalState(100000, { name: "Headphones", targetPaise: 50000 }, 10000);

test("onboarding reserves the first saving without changing the bank balance", () => {
  const state = create();
  assert.equal(state.goals.length, 1);
  assert.equal(state.transactions.length, 1);
  assert.equal(state.bankBalancePaise, 100000);
  assert.equal(savedFor(state, state.goals[0].id), 10000);
  assert.equal(safeToSpend(state), 90000);
  assert.equal(progressFor(state, state.goals[0]), 0.2);
  assert.deepEqual(decodeState(JSON.stringify(state)), state);
});

test("skipping the first saving and a zero balance create a goal without a transaction", () => {
  for (const balance of [0, 100000]) {
    const state = createPersonalState(balance, { name: "A trip", targetPaise: 50000 });
    assert.equal(state.transactions.length, 0);
    assert.equal(state.goals.length, 1);
    assert.equal(safeToSpend(state), balance);
  }
  assert.throws(() => createPersonalState(100000, undefined, 100), /Choose a goal/);
});

test("each step validates money and a custom name, including fractional amounts", () => {
  const draft = readyDraft();
  for (let step = 0; step <= 3; step++) assert.equal(stepError(draft, step), "");
  assert.ok(stepError({ ...draft, name: "   " }, 0));
  assert.equal(stepError({ ...draft, name: "My first guitar" }, 0), "");
  for (const input of ["", "-1", "1e3", "0", "1.001", "text"]) {
    assert.ok(stepError({ ...draft, target: input }, 1));
    assert.ok(stepError({ ...draft, allocation: input }, 3));
  }
  assert.equal(stepError({ ...draft, balance: "0" }, 2), "");
  assert.equal(stepError({ ...draft, allocation: "0.01" }, 3), "");
  assert.match(stepError({ ...draft, allocation: "1001" }, 3), /bank balance/);
  assert.match(stepError({ ...draft, allocation: "501" }, 3), /goal needs less/);
  assert.ok(stepError({ ...draft, balance: "50" }, 3));
  assert.ok(stepError({ ...draft, target: "50" }, 3));
});

test("invalid initial savings never produce a partly valid state", () => {
  for (const amount of [0, -1, 50001, 100001, 0.1]) {
    assert.throws(() => createPersonalState(100000, { name: "A trip", targetPaise: 50000 }, amount));
  }
});

test("draft restores unfinished input and returns to the earliest invalid prerequisite", () => {
  const draft = readyDraft();
  assert.deepEqual(decodeDraft(JSON.stringify({ ...draft, allocation: "" })), { ...draft, allocation: "" });
  assert.equal(decodeDraft(JSON.stringify({ ...draft, name: "" })).step, 0);
  assert.equal(decodeDraft(JSON.stringify({ ...draft, target: "" })).step, 1);
  assert.equal(decodeDraft(JSON.stringify({ ...draft, balance: "" })).step, 2);
  assert.equal(decodeDraft(null), null);
  assert.equal(decodeDraft("null"), null);
  for (const invalid of ["{", "{}", "[]", JSON.stringify({ ...draft, version: 2 }), JSON.stringify({ ...draft, step: 4 }), JSON.stringify({ ...draft, balance: null })]) {
    assert.throws(() => decodeDraft(invalid), /restart setup/);
  }
});

test("serialized draft writes restore the latest input and clear after pending writes", async () => {
  const disk = storage(); const store = new OnboardingDraftStore(disk);
  const first = { ...readyDraft(), step: 1, target: "1" };
  const second = readyDraft();
  const pending = store.save(first);
  first.target = "incorrect mutation";
  await Promise.all([pending, store.save(second)]);
  assert.deepEqual(await new OnboardingDraftStore(disk).read(), second);
  await Promise.all([store.save(second), store.clear()]);
  assert.equal(await store.read(), null);
});

test("draft storage failures are retryable and never change savings", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  await repo.activate("personal", create);
  const snapshot = disk.values.get(STORAGE_KEYS.personal);
  const store = new OnboardingDraftStore(disk);
  disk.failKey = ONBOARDING_KEY;
  await assert.rejects(store.save(readyDraft()), /storage full/);
  disk.failKey = null;
  await store.save(readyDraft());
  assert.deepEqual(await store.read(), readyDraft());
  assert.equal(disk.values.get(STORAGE_KEYS.personal), snapshot);
});

test("concurrent onboarding saves return one committed goal and contribution", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  const [first, second] = await Promise.all([repo.activate("personal", create), repo.activate("personal", create)]);
  assert.deepEqual(first, second);
  assert.equal(second.goals.length, 1);
  assert.equal(second.transactions.length, 1);
  const restored = new SavingsRepository(disk);
  await restored.restore();
  assert.deepEqual(restored.snapshot, second);
});

test("snapshot and selector failures publish no success; retry never duplicates savings", async () => {
  for (const failKey of [STORAGE_KEYS.personal, STORAGE_KEYS.mode]) {
    const disk = storage(); let publications = 0;
    const repo = new SavingsRepository(disk, () => publications++);
    disk.failKey = failKey;
    await assert.rejects(repo.activate("personal", create), /storage full/);
    assert.equal(repo.snapshot, null);
    assert.equal(publications, 0);
    const savedBeforeRetry = disk.values.get(STORAGE_KEYS.personal);
    disk.failKey = null;
    const result = await repo.activate("personal", create);
    assert.equal(result.goals.length, 1);
    assert.equal(result.transactions.length, 1);
    assert.equal(publications, 1);
    if (savedBeforeRetry) assert.deepEqual(result, JSON.parse(savedBeforeRetry));
  }
});

test("existing personal savings win over a stale draft or a new setup request", async () => {
  const disk = storage(); const repo = new SavingsRepository(disk);
  const original = await repo.activate("personal", create);
  await new OnboardingDraftStore(disk).save(readyDraft());
  const result = await repo.activate("personal", () => { throw new Error("must not recreate"); });
  assert.deepEqual(result, original);
});
