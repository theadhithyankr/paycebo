import test from "node:test";
import assert from "node:assert/strict";
import { decodeAppearance, resolveAppearance, paletteVariables, darkPalette, lightPalette } from "../src/lib/appearance.ts";
import { addAllowance, addExpense, addGoal, addTransaction, archiveAllowance, emptyState } from "../src/lib/model.ts";
import { decodeWidgetConfigs, makeWidgetViewModel } from "../src/lib/widget-model.ts";

const now = new Date(2026, 9, 6, 12);
function fixture() {
  let state = addGoal(emptyState(60000, now), { name: "Gamepad", targetPaise: 150000 }, now, "gamepad");
  state = addTransaction(state, "gamepad", "contribution", 16000, "", now);
  return addAllowance(state, { name: "Food", amountPaise: 10000, frequency: "daily" }, now, "food");
}
test("appearance defaults to System and resolves device preferences safely", () => {
  assert.equal(decodeAppearance(null), "system");
  for (const value of ["system", "light", "dark"]) assert.equal(decodeAppearance(JSON.stringify(value)), value);
  for (const raw of ["{", '"blue"', '{}']) assert.throws(() => decodeAppearance(raw));
  assert.equal(resolveAppearance("system", "dark"), "dark");
  assert.equal(resolveAppearance("system", null), "light");
  assert.equal(resolveAppearance("dark", "light"), "dark");
  assert.equal(resolveAppearance("light", "dark"), "light");
});
test("both appearances expose all semantic variables, including overlays", () => {
  assert.deepEqual(Object.keys(darkPalette).sort(), Object.keys(lightPalette).sort());
  const vars = paletteVariables(darkPalette);
  assert.equal(vars['--color-background'], '11 23 17');
  assert.equal(vars['--color-danger-surface'], '58 31 38');
  assert.notEqual(vars['--color-surface'], paletteVariables(lightPalette)['--color-surface']);
});
test("widget configurations retain independent entities and privacy per instance", () => {
  const config = { version: 1, instances: { 1: { family: "goal", entityId: "gamepad", showAmounts: true }, 2: { family: "allowance", entityId: "food", showAmounts: false } } };
  assert.deepEqual(decodeWidgetConfigs(JSON.stringify(config)), config);
  assert.deepEqual(decodeWidgetConfigs(null), { version: 1, instances: {} });
  for (const bad of [{ ...config, version: 2 }, { version: 1, instances: [] }, { version: 1, instances: { x: config.instances[1] } }, { version: 1, instances: { 1: { family: "income", showAmounts: true } } }, { version: 1, instances: { 1: { family: "goal" } } }]) assert.throws(() => decodeWidgetConfigs(JSON.stringify(bad)));
});
test("balance widget reuses all reservations and responds to recorded spending", () => {
  let state = fixture(); let model = makeWidgetViewModel(state, { family: "balance", showAmounts: true }, now);
  assert.equal(model.value, "₹340");
  assert.deepEqual(model.metrics.map(item => item.value), ["₹600", "₹160", "₹100"]);
  state = addExpense(state, "food", 3000, "", false, now);
  model = makeWidgetViewModel(state, { family: "balance", showAmounts: true }, now);
  assert.equal(model.value, "₹340"); assert.equal(model.metrics[0].value, "₹570"); assert.equal(model.metrics[2].value, "₹70");
});
test("hidden widget amounts never leak into text or accessibility", () => {
  for (const family of ["balance", "goal", "allowance"]) {
    const model = makeWidgetViewModel(fixture(), { family, entityId: family === "goal" ? "gamepad" : "food", showAmounts: false }, now);
    const rendered = JSON.stringify(model);
    for (const amount of ["₹600", "₹160", "₹100", "₹340", "₹1,500"]) assert.ok(!rendered.includes(amount));
    assert.match(model.accessibilityLabel, /[Aa]mounts? hidden/);
  }
});
test("goal widgets show actual progress and encode their personal deep link", () => {
  const model = makeWidgetViewModel(fixture(), { family: "goal", entityId: "gamepad", showAmounts: true }, now);
  assert.equal(model.title, "Gamepad"); assert.equal(model.value, "11%"); assert.equal(model.detail, "₹160 of ₹1,500");
  assert.equal(model.uri, "paycebo://widget-link?family=goal&id=gamepad");
});
test("allowance widgets recalculate reset periods rather than caching old remaining money", () => {
  const state = addExpense(fixture(), "food", 3000, "", false, now);
  const config = { family: "allowance", entityId: "food", showAmounts: true };
  assert.equal(makeWidgetViewModel(state, config, now).value, "₹70");
  assert.equal(makeWidgetViewModel(state, config, new Date(2026, 9, 7, 1)).value, "₹100");
  const overspent = addExpense(state, "food", 12000, "", true, now);
  const model = makeWidgetViewModel(overspent, config, now);
  assert.equal(model.value, "₹50"); assert.match(model.detail, /Over budget/);
});
test("missing sessions, missing goals, and archived allowances have clear placeholders", () => {
  assert.equal(makeWidgetViewModel(null, { family: "balance", showAmounts: true }, now).status, "setup");
  assert.equal(makeWidgetViewModel(fixture(), { family: "goal", entityId: "missing", showAmounts: true }, now).status, "missing");
  assert.equal(makeWidgetViewModel(archiveAllowance(fixture(), "food"), { family: "allowance", entityId: "food", showAmounts: true }, now).status, "missing");
});
