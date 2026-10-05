import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { demoState } from "../lib/demo";
import { addGoal, emptyState, generateReminders, type GoalInput, type Mode, type SavingsState } from "../lib/model";
import { SavingsRepository } from "../lib/repository";

interface SavingsContextValue {
  state: SavingsState | null;
  mode: Mode | null;
  ready: boolean;
  loadError: string | null;
  reminderError: string | null;
  refreshReminders: () => Promise<void>;
  retry: () => Promise<void>;
  startDemo: () => Promise<void>;
  startPersonal: (balance: number, firstGoal?: GoalInput) => Promise<void>;
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
    }, (next, nextMode) => { setState(next); setMode(nextMode); });
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
  const startPersonal = useCallback(async (balance: number, firstGoal?: GoalInput) => {
    await repository.activate("personal", () => firstGoal ? addGoal(emptyState(balance), firstGoal) : emptyState(balance));
    setLoadError(null);
  }, [repository]);
  const hasPersonal = useCallback(() => repository.hasPersonal(), [repository]);
  return <SavingsContext.Provider value={{ state, mode, ready, loadError, reminderError, refreshReminders, retry, startDemo, startPersonal, hasPersonal, update }}>{children}</SavingsContext.Provider>;
}

export function useSavings(): SavingsContextValue {
  const context = useContext(SavingsContext);
  if (!context) throw new Error("SavingsProvider is missing.");
  return context;
}
