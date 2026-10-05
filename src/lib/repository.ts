import { decodeState, type Mode, type SavingsState } from "./model.ts";

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export const STORAGE_KEYS = {
  personal: "paycebo:personal:v1",
  demo: "paycebo:demo:v1",
  mode: "paycebo:mode:v1",
} as const;

/** Every update reads the latest committed state inside the queue. Failed writes never publish. */
export class SavingsRepository {
  private queue: Promise<unknown> = Promise.resolve();
  private current: SavingsState | null = null;
  private active: Mode | null = null;
  private listener: (state: SavingsState | null, mode: Mode | null) => void;
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter, listener: (state: SavingsState | null, mode: Mode | null) => void = () => {}) {
    this.storage = storage;
    this.listener = listener;
  }
  get snapshot(): SavingsState | null { return this.current; }
  get mode(): Mode | null { return this.active; }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(task);
    this.queue = result.catch(() => {});
    return result;
  }
  restore(): Promise<void> {
    return this.enqueue(async () => {
      const savedMode = await this.storage.getItem(STORAGE_KEYS.mode);
      if (savedMode === null) return;
      if (savedMode !== "personal" && savedMode !== "demo") throw new Error("Your saved mode could not be read. Your data has been kept untouched.");
      const raw = await this.storage.getItem(STORAGE_KEYS[savedMode]);
      if (raw === null) throw new Error("Your saved session is missing. Try again; your other data has been kept untouched.");
      const state = decodeState(raw);
      this.current = state;
      this.active = savedMode;
      this.listener(state, savedMode);
    });
  }
  activate(mode: Mode, create?: () => SavingsState): Promise<void> {
    return this.enqueue(async () => {
      const raw = await this.storage.getItem(STORAGE_KEYS[mode]);
      let state: SavingsState;
      if (raw !== null) state = decodeState(raw);
      else {
        if (!create) throw new Error("Set up your personal balance first.");
        state = create();
        decodeState(JSON.stringify(state));
        await this.storage.setItem(STORAGE_KEYS[mode], JSON.stringify(state));
      }
      // Publish the switch only when its persisted selector is also written.
      await this.storage.setItem(STORAGE_KEYS.mode, mode);
      this.current = state;
      this.active = mode;
      this.listener(state, mode);
    });
  }
  hasPersonal(): Promise<boolean> {
    return this.enqueue(async () => {
      const raw = await this.storage.getItem(STORAGE_KEYS.personal);
      if (raw === null) return false;
      decodeState(raw);
      return true;
    });
  }
  update(change: (state: SavingsState) => SavingsState, expectedMode: Mode): Promise<SavingsState> {
    return this.enqueue(async () => {
      if (!this.current || !this.active || this.active !== expectedMode) {
        throw new Error("Your session changed. Reopen this screen before saving.");
      }
      const next = change(this.current);
      if (next === this.current) return next;
      decodeState(JSON.stringify(next));
      await this.storage.setItem(STORAGE_KEYS[this.active], JSON.stringify(next));
      this.current = next;
      this.listener(next, this.active);
      return next;
    });
  }
}
