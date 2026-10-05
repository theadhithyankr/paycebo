import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button, Display, ErrorNotice, Field, FormPage, Notice, palette, Txt } from "../src/components/ui";
import { parseMoney } from "../src/lib/model";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";

export default function Setup() {
  const { startPersonal, hasPersonal } = useSavings();
  const [balance, setBalance] = useState("");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [existing, setExisting] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const mounted = useRef(true);
  const checkPersonal = useCallback(async () => {
    setChecking(true); setError("");
    try { const value = await hasPersonal(); if (mounted.current) setExisting(value); }
    catch (err) { if (mounted.current) setError(errorMessage(err)); }
    finally { if (mounted.current) setChecking(false); }
  }, [hasPersonal]);
  useEffect(() => {
    mounted.current = true;
    void checkPersonal();
    return () => { mounted.current = false; };
  }, [checkPersonal]); // Read without touching an existing personal snapshot.
  async function save() {
    if (lock.current || existing === null) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await startPersonal(existing ? 0 : parseMoney(balance, true), existing ? undefined : { name, targetPaise: parseMoney(target) });
      router.replace("/(tabs)");
    } catch (err) { setError(errorMessage(err)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <FormPage title="Your future starts here" busy={busy}>
    <Display style={{ fontSize: 34, lineHeight: 42 }}>{existing ? "Welcome back." : "A balance. A goal.\nA little intention."}</Display>
    <Notice>Your bank balance is entered manually. Paying a goal reserves part of it inside Paycebo; no money is transferred.</Notice>
    {checking ? <ActivityIndicator color={palette.accent} /> : existing === null ? <Notice>Your personal session couldn’t be checked. Try again to continue without replacing any saved data.</Notice> : existing ? <Txt className="text-muted">Your personal goals and transactions are already here. Pick up where you left off.</Txt> : <View className="gap-6">
      <Field label="Current bank balance (₹)" value={balance} onChangeText={setBalance} placeholder="e.g. 48500" keyboardType="decimal-pad" maxLength={12} editable={!busy} hint="Include the money you’ll use to fund your goals." />
      <Field label="Your first goal" value={name} onChangeText={setName} placeholder="e.g. Sony Headset" maxLength={60} editable={!busy} autoCapitalize="words" />
      <Field label="Goal target (₹)" value={target} onChangeText={setTarget} placeholder="e.g. 25000" keyboardType="decimal-pad" maxLength={12} editable={!busy} />
    </View>}
    <ErrorNotice message={error} />
    {existing === null && !checking ? <Button label="Try reading storage again" variant="secondary" onPress={() => void checkPersonal()} /> : null}
    <Button label={existing ? "Resume personal savings" : "Create my savings space"} icon="arrow-up-right" disabled={existing === null || checking} loading={busy} onPress={() => void save()} />
    <Txt className="text-muted" style={{ fontSize: 13 }}>Everything stays on this device. You can update your balance and goals anytime.</Txt>
  </FormPage>;
}
