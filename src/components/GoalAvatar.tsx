import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { palette } from "./ui";
import type { Goal } from "../lib/model";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export function GoalAvatar({ goal, progress = 0, size = 76 }: { goal: Goal; progress?: number; size?: number }) {
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(true);
  const animated = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (active) setReduceMotion(value); }).catch(() => {});
    const listener = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => { active = false; listener.remove(); };
  }, []);
  useEffect(() => { setFailed(false); }, [goal.imageUrl]);
  useEffect(() => {
    const animation = Animated.timing(animated, { toValue: progress, duration: reduceMotion ? 0 : 350, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion, animated]);
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const initials = goal.name.split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase();
  return <View style={{ width: size, height: size }} accessible accessibilityLabel={goal.name + ", " + Math.round(progress * 100) + " percent saved"}>
    <Svg width={size} height={size} style={{ position: "absolute" }} accessible={false}>
      <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={palette.line} strokeWidth={3} />
      <AnimatedCircle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={goal.color} strokeWidth={3}
        strokeDasharray={[circumference, circumference]}
        strokeDashoffset={animated.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] })}
        strokeLinecap="round" rotation={-90} origin={size / 2 + ", " + size / 2} />
    </Svg>
    <View style={{ position: "absolute", top: 7, left: 7, width: size - 14, height: size - 14, borderRadius: size, overflow: "hidden", backgroundColor: goal.color + "25", alignItems: "center", justifyContent: "center" }}>
      {goal.imageUrl && !failed
        ? <Image source={{ uri: goal.imageUrl }} style={{ width: "100%", height: "100%" }} onError={() => setFailed(true)} accessible={false} />
        : <Text style={{ color: goal.color, fontSize: size / 3.2, fontWeight: "500" }}>{initials}</Text>}
    </View>
  </View>;
}
