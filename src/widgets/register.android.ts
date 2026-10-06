import { widgetsAvailable } from "./service.android";

// Expo Go lacks AndroidWidget. Keep normal app startup working there.
if (widgetsAvailable()) {
  const { registerWidgetTaskHandler, registerWidgetConfigurationScreen } = require("react-native-android-widget") as typeof import("react-native-android-widget");
  const { widgetTaskHandler } = require("./native.android") as typeof import("./native.android");
  const { WidgetConfigurationScreen } = require("./ConfigurationScreen.android") as typeof import("./ConfigurationScreen.android");
  registerWidgetTaskHandler(widgetTaskHandler);
  registerWidgetConfigurationScreen(WidgetConfigurationScreen);
}
