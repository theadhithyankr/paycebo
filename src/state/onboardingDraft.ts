import AsyncStorage from "@react-native-async-storage/async-storage";
import { OnboardingDraftStore } from "../lib/onboarding";

export const onboardingDraftStore = new OnboardingDraftStore({
  async getItem(key) {
    try { return await AsyncStorage.getItem(key); }
    catch { throw new Error("Couldn’t read your unfinished setup. Try again to recover your answers."); }
  },
  async setItem(key, value) {
    try { await AsyncStorage.setItem(key, value); }
    catch { throw new Error("Your answers are still here, but couldn’t be saved for next time. Free some device storage and retry."); }
  },
});
