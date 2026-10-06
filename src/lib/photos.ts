import { Directory, File, Paths } from "expo-file-system";
import { createId, validatePhotoId } from "./model";

function folder() { const directory = new Directory(Paths.document, "goal-photos"); directory.create({ idempotent: true, intermediates: true }); return directory; }
export async function storePhoto(uri: string): Promise<string> {
  const id = createId() + ".jpg";
  const destination = new File(folder(), id);
  try { new File(uri).copy(destination); }
  catch (error) { if (destination.exists) destination.delete(); throw error; }
  return id;
}
export async function resolvePhoto(id: string): Promise<string | null> {
  validatePhotoId(id); const file = new File(folder(), id); return file.exists ? file.uri : null;
}
export async function deletePhoto(id: string): Promise<void> {
  validatePhotoId(id); const file = new File(folder(), id); if (file.exists) file.delete();
}
