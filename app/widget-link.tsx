import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button, ErrorNotice, Page, Txt } from "../src/components/ui";
import { useSavings, errorMessage } from "../src/state/SavingsProvider";

export default function WidgetLink() {
  const { family, id } = useLocalSearchParams<{ family?: string; id?: string }>();
  const { ready, hasPersonal, startPersonal } = useSavings(); const [error, setError] = useState("");
  useEffect(() => {
    if (!ready) return; let active = true;
    void (async () => {
      if (!(await hasPersonal())) { if (active) router.replace("/"); return; }
      const state = await startPersonal(0); if (!active) return;
      if (family === "goal" && id && state.goals.some(item => item.id === id)) router.replace({ pathname: "/goal/[id]", params: { id } });
      else if (family === "allowance" && id && state.allowances.some(item => item.id === id && !item.archived)) router.replace({ pathname: "/allowance/[id]", params: { id } });
      else router.replace("/(tabs)");
    })().catch(err => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, [ready, family, id, hasPersonal, startPersonal]);
  return <Page><View className="flex-1 justify-center gap-4">{error ? <><ErrorNotice message={error} /><Button label="Open Paycebo" onPress={() => router.replace("/")} /></> : <><ActivityIndicator /><Txt>Opening your personal savings…</Txt></>}</View></Page>;
}
