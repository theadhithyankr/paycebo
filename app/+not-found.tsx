import { router } from "expo-router";
import React from "react";
import { Button, Empty, Page } from "../src/components/ui";

export default function NotFound() {
  return <Page><Empty title="A little off track" description="This screen isn’t here. Let’s get you back to your goals." action={<Button label="Go home" onPress={() => router.replace("/")} />} /></Page>;
}
