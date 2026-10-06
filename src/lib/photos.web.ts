import { createId, validatePhotoId } from "./model";

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("paycebo-photos", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("photos");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Photo storage is unavailable. Try another browser or free some storage."));
  });
}
async function operation<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("photos", mode);
    const request = work(transaction.objectStore("photos"));
    transaction.oncomplete = () => { db.close(); resolve(request.result); };
    transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error("The photo couldn’t be saved. Free some storage and retry.")); };
  });
}
export async function storePhoto(uri: string): Promise<string> {
  const response = await fetch(uri); if (!response.ok) throw new Error("The selected photo couldn’t be read.");
  const blob = await response.blob(); const id = createId() + ".jpg";
  await operation("readwrite", (store) => store.put(blob, id)); return id;
}
export async function resolvePhoto(id: string): Promise<string | null> {
  validatePhotoId(id); const blob = await operation<Blob | undefined>("readonly", (store) => store.get(id));
  return blob ? URL.createObjectURL(blob) : null;
}
export async function deletePhoto(id: string): Promise<void> {
  validatePhotoId(id); await operation("readwrite", (store) => store.delete(id));
}
