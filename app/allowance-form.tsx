import { Redirect, router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { GoalAvatar } from "../src/components/GoalAvatar";
import { PhotoControl, usePhotoChoice } from "../src/components/PhotoControl";
import { Button, ErrorNotice, Field, FormPage, palette, Txt } from "../src/components/ui";
import { addAllowance, allowanceSpent, COLORS, editAllowance, inputMoney, money, parseMoney, type Allowance, type Frequency } from "../src/lib/model";
import { errorMessage, useSavings } from "../src/state/SavingsProvider";
import { deleteUnreferencedPhoto } from "../src/state/photoCleanup";

export default function AllowanceForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, update, now } = useSavings();
  const existing = state?.allowances.find((item) => item.id === id);
  const [name, setName] = useState(existing?.name ?? "");
  const [amount, setAmount] = useState(existing ? inputMoney(existing.amountPaise) : "");
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? "daily");
  const [color, setColor] = useState(existing?.color ?? COLORS[0]);
  const photo = usePhotoChoice(existing?.photoId, existing?.imageUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  if (!state) return <Redirect href="/" />;
  if (id && (!existing || existing.archived)) return <FormPage title="Allowance unavailable"><Txt>This allowance is unavailable or archived.</Txt><Button label="Go home" onPress={() => router.replace("/(tabs)")} /></FormPage>;
  let value = 0; try { value = parseMoney(amount); } catch {}
  const preview: Allowance = { id: id ?? "preview", name: name.trim() || "Your allowance", amountPaise: value, frequency, color, imageUrl: photo.imageUrl,
    photoId: photo.photoId, createdAt: existing?.createdAt ?? now.toISOString(), archived: false };
  const spent = allowanceSpent(state, preview, now);
  async function save() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const amountPaise = parseMoney(amount); const appearance = await photo.prepare();
      const input = { name, amountPaise, frequency, color, ...appearance };
      await update((current) => id ? editAllowance(current, id, input) : addAllowance(current, input));
      if (existing?.photoId && existing.photoId !== appearance.photoId) void deleteUnreferencedPhoto(existing.photoId).catch(() => {});
      if (router.canGoBack()) router.back(); else router.replace("/(tabs)");
    } catch (err) { setError(errorMessage(err)); }
    finally { photo.settled(); lock.current = false; setBusy(false); }
  }
  return <FormPage title={existing ? "Edit allowance" : "A little for everyday"} busy={busy}>
    <View className="items-center"><GoalAvatar goal={preview} size={88} previewUri={photo.uri} accessibilityLabel="Allowance photo preview" /></View>
    <Field label="Allowance name" value={name} onChangeText={setName} placeholder="e.g. Food" maxLength={60} editable={!busy} autoCapitalize="words" />
    <Field label="Amount per period (₹)" value={amount} onChangeText={setAmount} placeholder="e.g. 100" keyboardType="decimal-pad" maxLength={12} editable={!busy} />
    <View className="gap-3"><Txt className="font-medium">Refreshes</Txt><View className="flex-row flex-wrap gap-2">
      {(["daily", "weekly", "monthly"] as const).map((item) => <Pressable key={item} accessibilityRole="button" accessibilityLabel={item} accessibilityState={{ selected: item === frequency, disabled: busy }} disabled={busy} onPress={() => setFrequency(item)}
        className={"min-h-[48px] px-5 py-3 rounded-2xl " + (frequency === item ? "bg-accent" : "bg-elevated")}><Txt>{item.charAt(0).toUpperCase() + item.slice(1)}</Txt></Pressable>)}
      </View><Txt className="text-muted" style={{ fontSize: 13 }}>Resets {frequency === "daily" ? "at midnight" : frequency === "weekly" ? "on Monday" : "on the 1st"}. Unused allowance doesn’t carry over.</Txt>
    </View>
    <PhotoControl photo={photo} disabled={busy} />
    <View className="gap-2"><Txt className="font-medium">Color</Txt><View className="flex-row gap-2">{COLORS.slice(0, 5).map((item, index) => <Pressable key={item} accessibilityRole="button" accessibilityLabel={["Green", "Blue", "Forest", "Lavender", "Rose"][index]} accessibilityState={{ selected: color === item, disabled: busy }} disabled={busy} onPress={() => setColor(item)}
      style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: color === item ? item : "transparent", alignItems: "center", justifyContent: "center" }}><View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: item }} /></Pressable>)}</View></View>
    {value > 0 ? <View className="bg-surface rounded-2xl p-4 gap-1"><Txt>Current period reservation: {money(Math.max(0, value - spent))}</Txt>{spent > 0 ? <Txt className="text-muted" style={{ fontSize: 13 }}>Already spent this period: {money(spent)}</Txt> : null}<Txt className="text-muted" style={{ fontSize: 13 }}>Changes apply to this period.</Txt></View> : null}
    <ErrorNotice message={error} />
    <Button label={existing ? "Save allowance" : "Create allowance"} loading={busy} disabled={photo.busy} onPress={() => void save()} />
  </FormPage>;
}
