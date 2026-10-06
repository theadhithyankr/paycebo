import { useAppTheme } from "../state/AppearanceProvider";
import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, Platform, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { palette } from "./ui";
import type { Goal } from "../lib/model";
import { resolvePhoto } from "../lib/photos";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export function GoalAvatar({ goal, progress = 0, size = 76, accessibilityLabel, previewUri, showProgress = true }: { goal: Pick<Goal, "name" | "color" | "imageUrl" | "photoId">; progress?: number; size?: number; accessibilityLabel?: string; previewUri?: string; showProgress?: boolean }) {
  const { colors: palette } = useAppTheme();
  const [localUri, setLocalUri] = useState<string | null>(null);
  useEffect(() => {
    let alive = true; let resolved: string | null = null; setLocalUri(null);
    if (goal.photoId) void resolvePhoto(goal.photoId).then((uri) => {
      resolved = uri;
      if (alive) setLocalUri(uri); else if (Platform.OS === "web" && uri?.startsWith("blob:")) URL.revokeObjectURL(uri);
    }).catch(() => {});
    return () => { alive = false; if (Platform.OS === "web" && resolved?.startsWith("blob:")) URL.revokeObjectURL(resolved); };
  }, [goal.photoId]);
  const imageUri = previewUri ?? (goal.photoId ? localUri : goal.imageUrl);
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const animated = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduceMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => { active = false; listener.remove(); };
  }, []);
  useEffect(() => { setFailed(false); }, [imageUri]);
  useEffect(() => {
    const animation = Animated.timing(animated, { toValue: progress, duration: reduceMotion ? 0 : 350, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion, animated]);
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const ring = { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: goal.color, strokeWidth: 3,
    strokeDasharray: [circumference, circumference], strokeLinecap: "round" as const, transform: `rotate(-90 ${size / 2} ${size / 2})` };
  const initials = goal.name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
  return <View style={{ width: size, height: size }} accessible accessibilityLabel={accessibilityLabel ?? goal.name + ", " + Math.round(progress * 100) + " percent saved"}>
    {showProgress ? <Svg width={size} height={size} style={{ position: "absolute" }} accessible={Platform.OS === "web" ? undefined : false} aria-hidden={true}>
      <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={palette.line} strokeWidth={3} />
      {Platform.OS === "web" ? <Circle {...ring} strokeDashoffset={circumference * (1 - progress)} />
        : <AnimatedCircle {...ring} strokeDashoffset={animated.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] })} />}
    </Svg> : null}
    <View style={{ position: "absolute", top: 7, left: 7, width: size - 14, height: size - 14, borderRadius: size, overflow: "hidden", backgroundColor: goal.color + "25", alignItems: "center", justifyContent: "center" }}>
      {imageUri && !failed
        ? <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} onError={() => setFailed(true)} accessible={false} />
        : <Text style={{ color: palette.foreground, fontSize: size / 3.2, fontWeight: "500" }}>{initials}</Text>}
    </View>
  </View>;
}
