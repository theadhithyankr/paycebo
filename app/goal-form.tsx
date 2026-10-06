import { useAppTheme } from "../src/state/AppearanceProvider";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { GoalAvatar } from "../src/components/GoalAvatar";
import { Button, DemoBanner, Empty, ErrorNotice, Field, FormPage, Notice, Txt } from "../src/components/ui";
import { addGoal, COLORS, editGoal, inputMoney, parseMoney, savedFor, WEEKDAYS, type Goal } from "../src/lib/model";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";
import { PhotoControl, usePhotoChoice } from "../src/components/PhotoControl";
import { deleteUnreferencedPhoto } from "../src/state/photoCleanup";

export default function GoalForm() {
  const { colors: palette } = useAppTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, update } = useSavings();
  const existing = state?.goals.find((goal) => goal.id === id);
  const [name, setName] = useState(existing?.name ?? "");
  const [target, setTarget] = useState(existing ? inputMoney(existing.targetPaise) : "");
  const photo = usePhotoChoice(existing?.photoId, existing?.imageUrl);
  const [weekly, setWeekly] = useState(existing?.weeklyPaise ? inputMoney(existing.weeklyPaise) : "");
  const [dueDay, setDueDay] = useState(existing?.dueDay ?? 5);
  const [color, setColor] = useState<string>(existing?.color ?? COLORS[(state?.goals.length ?? 0) % COLORS.length]!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  if (!state) return <Redirect href="/" />;
  if (id && !existing) return <FormPage title="Goal unavailable"><Empty title="This goal isn’t here" description="Return home to choose another goal." action={<Button label="Go home" onPress={() => router.replace("/(tabs)")} />} /></FormPage>;
  const preview: Goal = { id: "preview", name: name.trim() || "Your Goal", targetPaise: 1, weeklyPaise: 0, dueDay, imageUrl: photo.imageUrl, photoId: photo.photoId, color, createdAt: new Date().toISOString() };
  async function save() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const targetPaise = parseMoney(target);
      const image = await photo.prepare();
      const input = { name, targetPaise, ...image, color, weeklyPaise: weekly.trim() ? parseMoney(weekly, true) : 0, dueDay };
      await update((current) => id ? editGoal(current, id, input) : addGoal(current, input));
      if (existing?.photoId && existing.photoId !== image.photoId) void deleteUnreferencedPhoto(existing.photoId).catch(() => {});
      router.back();
    } catch (err) { setError(errorMessage(err)); }
    finally { photo.settled(); lock.current = false; setBusy(false); }
  }
  return <FormPage title={existing ? "Edit your goal" : "Meet your next goal"} busy={busy} footer={<><ErrorNotice message={error} /><Button label={existing ? "Save changes" : "Create goal"} icon={existing ? "check" : "plus"} disabled={photo.busy} loading={busy} onPress={() => void save()} /></>}>
    <DemoBanner />
    <View className="items-center gap-3"><GoalAvatar goal={preview} previewUri={photo.uri} size={88} /></View>
    <Field label="Goal name" value={name} onChangeText={setName} placeholder="e.g. A week in the mountains" maxLength={60} editable={!busy} autoCapitalize="words" />
    <Field label="Target amount (₹)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="e.g. 25000" maxLength={12} editable={!busy} hint={existing ? "Already saved: " + inputMoney(savedFor(state, existing.id)) + " rupees" : undefined} />
    <PhotoControl photo={photo} disabled={busy} />
    <View className="gap-3">
      <Txt className="font-medium">Goal color</Txt>
      <View className="flex-row flex-wrap gap-2">{COLORS.slice(0, 5).map((item, index) => <Pressable key={item} accessibilityRole="button" accessibilityLabel={["Green", "Blue", "Forest", "Lavender", "Rose"][index] + " goal color"} accessibilityState={{ selected: color === item, disabled: busy }} disabled={busy} onPress={() => setColor(item)}
        className="w-12 h-12 rounded-full items-center justify-center" style={{ borderWidth: color === item ? 2 : 0, borderColor: item }}>
        <View className="w-8 h-8 rounded-full" style={{ backgroundColor: item }} />
      </Pressable>)}</View>
    </View>
    <View className="h-px bg-line" />
    <Field label="Weekly pledge (₹, optional)" value={weekly} onChangeText={setWeekly} keyboardType="decimal-pad" maxLength={12} placeholder="e.g. 500" editable={!busy} hint="Leave empty or enter 0 to turn off weekly reminders." />
    <View className="gap-3">
      <Txt className="font-medium">Pledge day</Txt>
      <View className="flex-row flex-wrap gap-2">{WEEKDAYS.map((day, index) => <Pressable key={day} onPress={() => setDueDay(index + 1)} disabled={busy} accessibilityRole="button" accessibilityLabel={day} accessibilityState={{ selected: dueDay === index + 1, disabled: busy }}
        className="min-h-[48px] px-4 rounded-xl justify-center" style={{ backgroundColor: dueDay === index + 1 ? palette.accent : palette.elevated }}>
        <Txt style={{ color: dueDay === index + 1 ? "#17120D" : palette.muted, fontSize: 14 }}>{day.slice(0, 3)}</Txt>
      </Pressable>)}</View>
    </View>
    <Notice>Reminders appear in your goal’s chat when you open Paycebo on or after your pledge day. They count that week’s payments minus requests.</Notice>
  </FormPage>;
}
