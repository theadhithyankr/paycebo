import { addGoal, addTransaction, emptyState, type SavingsState } from "./model.ts";

export function demoState(now = new Date()): SavingsState {
  let state = emptyState(4_850_000, now);
  const date = (daysAgo: number) => {
    const day = new Date(now);
    day.setDate(day.getDate() - daysAgo);
    day.setHours(12, 0, 0, 0);
    return day;
  };
  state = addGoal(state, {
    name: "Sony Headset", targetPaise: 2_500_000, weeklyPaise: 150_000,
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop",
    color: "#EDB780",
  }, date(30), "headset");
  state = addGoal(state, {
    name: "New Car", targetPaise: 50_000_000, weeklyPaise: 250_000,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=300&fit=crop",
    color: "#B5C5E8",
  }, date(30), "car");
  state = addGoal(state, { name: "Emergency Fund", targetPaise: 10_000_000, weeklyPaise: 100_000, color: "#A9D6B2" }, date(30), "emergency");
  state = addTransaction(state, "headset", "contribution", 500_000, "A little closer to better sound", date(12), "demo-t1");
  state = addTransaction(state, "car", "contribution", 750_000, "One day, an open road", date(10), "demo-t2");
  state = addTransaction(state, "emergency", "contribution", 1_000_000, "A cushion for the unexpected", date(8), "demo-t3");
  state = addTransaction(state, "headset", "contribution", 50_000, "Skipped ordering pizza", date(2), "demo-t4");
  state = addTransaction(state, "headset", "contribution", 25_000, "Made coffee at home", date(1), "demo-t5");
  state = addTransaction(state, "car", "withdrawal", 25_000, "Needed a little breathing room", date(1), "demo-t6");
  return state;
}
