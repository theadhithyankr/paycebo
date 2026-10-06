import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { demoState } from "../lib/demo";
import { generateReminders, type GoalInput, type Mode, type SavingsState } from "../lib/model";
import { SavingsRepository } from "../lib/repository";
import { createPersonalState } from "../lib/onboarding";

interface SavingsContextValue {
  state: SavingsState | null;
  mode: Mode | null;
  ready: boolean;
  now: Date;
  loadError: string | null;
  reminderError: string | null;
  refreshReminders: () => Promise<void>;
  retry: () => Promise<void>;
  startDemo: () => Promise<void>;
  startPersonal: (balance: number, firstGoal?: GoalInput, initialContribution?: number) => Promise<SavingsState>;
  hasPersonal: () => Promise<boolean>;
  update: (change: (state: SavingsState) => SavingsState) => Promise<SavingsState>;
}
const SavingsContext = createContext<SavingsContextValue | null>(null);

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "That could not be saved. Please try again.";
}

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SavingsState | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const time = new Date(); setNow(time);
      const midnight = new Date(time); midnight.setHours(24, 0, 0, 0);
      clearTimeout(timer); timer = setTimeout(refresh, midnight.getTime() - time.getTime() + 50);
    };
    refresh();
    const subscription = AppState.addEventListener("change", (status) => { if (status === "active") refresh(); });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, []);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const repositoryRef = useRef<SavingsRepository | null>(null);
  if (!repositoryRef.current) {
    repositoryRef.current = new SavingsRepository({
      async getItem(key) {
        try { return await AsyncStorage.getItem(key); }
        catch { throw new Error("Couldn’t read this device’s storage. Please try again. Your data has been kept untouched."); }
      },
      async setItem(key, value) {
        try { await AsyncStorage.setItem(key, value); }
        catch { throw new Error("Couldn’t save on this device. Free some storage and try again. Your changes haven’t been applied."); }
      },
    }, (next, nextMode) => { setState(next); setMode(nextMode); setNow(new Date()); });
  }
  const repository = repositoryRef.current;
  const retry = useCallback(async () => {
    setLoadError(null);
    setReady(false);
    try { await repository.restore(); }
    catch (error) { setLoadError(errorMessage(error)); }
    finally { setReady(true); }
  }, [repository]);
  useEffect(() => { void retry(); }, [retry]);
  const refreshReminders = useCallback(async () => {
    const currentMode = repository.mode;
    if (!currentMode) return;
    try {
      await repository.update((current) => generateReminders(current), currentMode);
      setReminderError(null);
    } catch (error) { setReminderError(errorMessage(error)); }
  }, [repository]);
  useEffect(() => {
    if (ready && mode) void refreshReminders();
    const subscription = AppState.addEventListener("change", (status) => { if (status === "active") void refreshReminders(); });
    return () => subscription.remove();
  }, [ready, mode, refreshReminders]); // Transactions do not spam reminders.

  const update = useCallback(async (change: (current: SavingsState) => SavingsState) => {
    if (!mode) throw new Error("Set up a balance first.");
    return repository.update(change, mode);
  }, [repository, mode]);
  const startDemo = useCallback(async () => {
    await repository.activate("demo", () => demoState());
    setLoadError(null);
  }, [repository]);
  const startPersonal = useCallback(async (balance: number, firstGoal?: GoalInput, initialContribution?: number) => {
    const committed = await repository.activate("personal", () => createPersonalState(balance, firstGoal, initialContribution));
    setLoadError(null);
    return committed;
  }, [repository]);
  const hasPersonal = useCallback(() => repository.hasPersonal(), [repository]);
  return <SavingsContext.Provider value={{ state, mode, ready, now, loadError, reminderError, refreshReminders, retry, startDemo, startPersonal, hasPersonal, update }}>{children}</SavingsContext.Provider>;
}

export function useSavings(): SavingsContextValue {
  const context = useContext(SavingsContext);
  if (!context) throw new Error("SavingsProvider is missing.");
  return context;
}
