import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { decodeFundingHints, FUNDING_HINTS_KEY } from "../lib/goal-funding";

const Context = createContext<{ enabled: boolean; ready: boolean; busy: boolean; error: string; setEnabled: (enabled: boolean) => Promise<void> } | null>(null);
export function FundingHintsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setValue] = useState(true); const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const lock = useRef(false);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(FUNDING_HINTS_KEY).then(raw => { if (active) setValue(decodeFundingHints(raw)); })
      .catch(() => { if (active) setError("Explanations couldn’t be read. They’re on; your savings are unaffected."); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  async function setEnabled(value: boolean) {
    if (lock.current || !ready) return;
    lock.current = true; setBusy(true); setError("");
    try { await AsyncStorage.setItem(FUNDING_HINTS_KEY, JSON.stringify(value)); setValue(value); }
    catch { setError("Your explanation preference couldn’t be saved. Your previous choice is still active. Try again."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Context.Provider value={{ enabled, ready, busy, error, setEnabled }}>{children}</Context.Provider>;
}
export function useFundingHints() { const value = useContext(Context); if (!value) throw new Error("FundingHintsProvider is missing."); return value; }
