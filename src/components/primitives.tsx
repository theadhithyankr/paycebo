import { createButton } from "@gluestack-ui/core/button/creator";
import { createInput } from "@gluestack-ui/core/input/creator";
import { createModal } from "@gluestack-ui/core/modal/creator";
import { createActionsheet } from "@gluestack-ui/core/actionsheet/creator";
import { ActivityIndicator, FlatList, Pressable, ScrollView, SectionList, Text, TextInput, View, VirtualizedList } from "react-native";
export { OverlayProvider as GluestackUIProvider } from "@gluestack-ui/core/overlay/creator";

// Owned gluestack primitives: style them with the existing NativeWind 4 setup.
export const UIAction = createButton({ Root: Pressable, Text, Group: View, Spinner: ActivityIndicator, Icon: View });
export const UIInput = createInput({ Root: View, Icon: View, Slot: Pressable, Input: TextInput });
export const UIDialog = createModal({ Root: View, Content: View, CloseButton: Pressable, Header: View, Footer: View, Body: ScrollView, Backdrop: Pressable });
export const UISheet = createActionsheet({ Root: View, Backdrop: Pressable, Item: Pressable, ItemText: Text,
  DragIndicator: View, IndicatorWrapper: View, Content: View, ScrollView, VirtualizedList, FlatList, SectionList, SectionHeaderText: Text, Icon: View });
