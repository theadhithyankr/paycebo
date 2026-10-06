// Browser and iOS do not import the Android native module.
export async function refreshWidgets(): Promise<void> {}
export async function pinWidget(_family: string): Promise<boolean> { return false; }
export function widgetsAvailable(): boolean { return false; }
