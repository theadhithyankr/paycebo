import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeState } from "../lib/model";
import { deletePhoto } from "../lib/photos";
import { STORAGE_KEYS } from "../lib/repository";

/** Corrupt/unreadable snapshots stop cleanup; they may still reference this file. */
export async function deleteUnreferencedPhoto(id: string): Promise<void> {
  for (const key of [STORAGE_KEYS.personal, STORAGE_KEYS.demo]) {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const state = decodeState(raw);
      if ([...state.goals, ...state.allowances].some((item) => item.photoId === id)) return;
    }
  }
  await deletePhoto(id);
}
