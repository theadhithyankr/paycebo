import React from "react";
import { FlexWidget, TextWidget, type WidgetRepresentation } from "react-native-android-widget";
import { darkPalette, lightPalette, type AppearancePreference, type Palette } from "../lib/appearance";
import type { WidgetViewModel } from "../lib/widget-model";

function WidgetCard({ model, colors, width }: { model: WidgetViewModel; colors: Palette; width: number }) {
  const compact = width < 240;
  const moneySize = model.value.length > 12 ? 17 : compact ? 22 : 30;
  return <FlexWidget clickAction="OPEN_URI" clickActionData={{ uri: model.uri }} accessibilityLabel={model.accessibilityLabel}
    style={{ width: "match_parent", height: "match_parent", backgroundColor: colors.background as `#${string}`, borderRadius: 24, padding: compact ? 14 : 18, flexDirection: "column", justifyContent: "space-between" }}>
    <TextWidget text={model.title} maxLines={2} style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground as `#${string}`, fontFamily: "Manrope_700Bold" }} />
    <TextWidget text={model.value} style={{ fontSize: moneySize, fontWeight: "bold", color: colors.foreground as `#${string}`, fontFamily: "Manrope_700Bold", adjustsFontSizeToFit: true }} />
    {model.family !== "balance" && model.status === "ready" ? <FlexWidget style={{ width: "match_parent", height: 5, backgroundColor: colors.line as `#${string}`, borderRadius: 3, flexDirection: "row" }}>
      <FlexWidget style={{ width: Math.max(1, (width - (compact ? 28 : 36)) * model.progress), height: 5, borderRadius: 3, backgroundColor: colors.accent as `#${string}` }} />
    </FlexWidget> : null}
    {model.metrics ? <FlexWidget style={{ flexDirection: "row", justifyContent: "space-between", width: "match_parent" }}>{model.metrics.map(item => <FlexWidget key={item.label} style={{ flex: 1, flexDirection: "column" }}>
      <TextWidget text={item.label} style={{ fontSize: 10, color: colors.muted as `#${string}` }} />
      <TextWidget text={item.value} style={{ fontSize: item.value.length > 10 ? 10 : 12, fontWeight: "bold", color: colors.foreground as `#${string}`, adjustsFontSizeToFit: true }} />
    </FlexWidget>)}</FlexWidget> : <TextWidget text={model.detail} maxLines={2} style={{ fontSize: 12, color: colors.muted as `#${string}` }} />}
    <TextWidget text={model.updated || "Tap to open Paycebo"} style={{ fontSize: 10, color: colors.muted as `#${string}` }} />
  </FlexWidget>;
}
export function widgetRepresentation(model: WidgetViewModel, preference: AppearancePreference, width: number): WidgetRepresentation {
  const light = <WidgetCard model={model} colors={lightPalette} width={width} />;
  const dark = <WidgetCard model={model} colors={darkPalette} width={width} />;
  return preference === "system" ? { light, dark } : preference === "dark" ? dark : light;
}
