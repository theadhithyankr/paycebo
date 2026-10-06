import React, { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Platform, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { deleteUnreferencedPhoto } from "../state/photoCleanup";
import { storePhoto } from "../lib/photos";
import { ActionSheet, Button, ErrorNotice } from "./ui";

export function usePhotoChoice(initialPhotoId?: string, initialUrl = "") {
  const [photoId, setPhotoId] = useState(initialPhotoId);
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [uri, setUri] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [denied, setDenied] = useState(false);
  const stagedId = useRef<string | undefined>(undefined);
  const previewRef = useRef<string | undefined>(undefined);
  const saving = useRef(false);
  const mounted = useRef(true);
  const lock = useRef(false);
  const discardStaged = useCallback(() => {
    // A native swipe may unmount the form during an async snapshot write.
    // Wait for that write to settle before checking whether its photo is owned.
    if (saving.current) return;
    const id = stagedId.current; stagedId.current = undefined;
    if (id) void deleteUnreferencedPhoto(id).catch(() => {});
  }, []);
  const accept = useCallback(async (asset: ImagePicker.ImagePickerAsset) => {
    const context = ImageManipulator.manipulate(asset.uri);
    if (Math.max(asset.width, asset.height) > 1024) context.resize(asset.width >= asset.height ? { width: 1024 } : { height: 1024 });
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
    context.release(); rendered.release();
    if (Platform.OS === "web" && asset.uri.startsWith("blob:")) URL.revokeObjectURL(asset.uri);
    if (mounted.current) {
      if (Platform.OS === "web" && previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
      previewRef.current = saved.uri;
      discardStaged(); setUri(saved.uri); setPhotoId(undefined); setImageUrl("");
    } else if (Platform.OS === "web" && saved.uri.startsWith("blob:")) URL.revokeObjectURL(saved.uri);
  }, [discardStaged]);
  useEffect(() => {
    mounted.current = true;
    if (Platform.OS === "android") void ImagePicker.getPendingResultAsync().then(async (result) => {
      if (result && "assets" in result && !result.canceled && result.assets?.[0]) await accept(result.assets[0]);
    }).catch(() => { if (mounted.current) setError("The photo couldn’t be recovered. Choose it again."); });
    return () => { mounted.current = false; discardStaged(); if (!saving.current && Platform.OS === "web" && previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current); };
  }, [accept, discardStaged]);
  async function choose(camera: boolean) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setDenied(false);
    try {
      if (camera && Platform.OS !== "web") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) { setDenied(true); throw new Error("Camera access is off. Choose from your gallery, or enable the camera in Settings."); }
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: Platform.OS !== "web", aspect: [1, 1], quality: 1, exif: false };
      const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) await accept(result.assets[0]);
    } catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : "That photo couldn’t be opened. Try choosing another."); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  function remove() { discardStaged(); if (Platform.OS === "web" && previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current); previewRef.current = undefined; setUri(undefined); setPhotoId(undefined); setImageUrl(""); setError(""); }
  async function prepare() {
    saving.current = true;
    if (uri && !stagedId.current) stagedId.current = await storePhoto(uri);
    return { imageUrl, ...(stagedId.current || photoId ? { photoId: stagedId.current ?? photoId } : {}) };
  }
  function settled() {
    saving.current = false;
    if (!mounted.current) {
      discardStaged();
      if (Platform.OS === "web" && previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    }
  }
  return { photoId, imageUrl, uri, busy, error, denied, choose, remove, prepare, settled };
}

export function PhotoControl({ photo, disabled = false }: { photo: ReturnType<typeof usePhotoChoice>; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const hasPhoto = Boolean(photo.uri || photo.photoId || photo.imageUrl);
  return <View className="gap-2">
    <Button label={hasPhoto ? "Change photo" : "Add photo"} variant="secondary" icon="camera" disabled={disabled || photo.busy} onPress={() => setOpen(true)} />
    <ErrorNotice message={photo.error} />
    {photo.denied && Platform.OS !== "web" ? <Button label="Open camera settings" variant="ghost" onPress={() => void Linking.openSettings()} /> : null}
    <ActionSheet open={open} onClose={() => setOpen(false)} title="Your goal, your photo">
      <Button label="Choose photo" icon="image" variant="secondary" onPress={() => { setOpen(false); void photo.choose(false); }} />
      <Button label="Take photo" icon="camera" variant="secondary" onPress={() => { setOpen(false); void photo.choose(true); }} />
      {hasPhoto ? <Button label="Remove photo" variant="danger" onPress={() => { setOpen(false); photo.remove(); }} /> : null}
    </ActionSheet>
  </View>;
}
