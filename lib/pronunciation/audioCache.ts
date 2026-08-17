/**
 * IndexedDB-backed cache for generated pronunciation audio.
 *
 * This is the whole reason we never need Supabase Storage for audio: once a
 * clip is generated it lives in the learner's own browser (IndexedDB), which
 * also means it plays back fine offline. Nothing here ever leaves the
 * device — no upload, no server round-trip on cache hits.
 *
 * Dependency-free on purpose (same philosophy as sound-fx.ts): this uses the
 * native `indexedDB` API directly instead of pulling in a library for what
 * is ultimately a tiny key → Blob store.
 */

const DB_NAME = "hitako-pronunciation-cache";
const DB_VERSION = 1;
const STORE_NAME = "audio-clips";

/** Soft cap on the number of cached clips. Oldest clips are evicted first. */
const MAX_ENTRIES = 400;

interface CachedClipRecord {
  key: string;
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open pronunciation cache DB"));
  });
  return dbPromise;
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

/** Fast, deterministic, non-cryptographic hash — good enough for a cache key. */
function hashString(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

/** Builds a stable cache key from everything that changes the resulting audio. */
export function buildCacheKey(text: string, voiceId: string, lang: string, rate: number): string {
  const normalizedText = text.trim().toLowerCase();
  return `${lang}:${voiceId}:${rate.toFixed(2)}:${hashString(normalizedText)}`;
}

class AudioCacheStore {
  async get(key: string): Promise<Blob | null> {
    if (!isIndexedDBAvailable()) return null;
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const record = await promisifyRequest<CachedClipRecord | undefined>(
        tx.objectStore(STORE_NAME).get(key),
      );
      return record?.blob ?? null;
    } catch (err) {
      console.warn("[PronunciationCache] read failed, treating as cache miss", err);
      return null;
    }
  }

  async set(key: string, blob: Blob): Promise<void> {
    if (!isIndexedDBAvailable()) return;
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const record: CachedClipRecord = { key, blob, mimeType: blob.type, createdAt: Date.now() };
      tx.objectStore(STORE_NAME).put(record);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Cache write failed"));
      });
      void this.enforceCapAsync();
    } catch (err) {
      // Caching is a best-effort optimization — failing to write (e.g. quota
      // exceeded, private browsing) should never break playback.
      console.warn("[PronunciationCache] write failed, continuing without cache", err);
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  async clear(): Promise<void> {
    if (!isIndexedDBAvailable()) return;
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Cache clear failed"));
      });
    } catch (err) {
      console.warn("[PronunciationCache] clear failed", err);
    }
  }

  async stats(): Promise<{ count: number; approxBytes: number }> {
    if (!isIndexedDBAvailable()) return { count: 0, approxBytes: 0 };
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const all = await promisifyRequest<CachedClipRecord[]>(tx.objectStore(STORE_NAME).getAll());
      return {
        count: all.length,
        approxBytes: all.reduce((sum, r) => sum + (r.blob?.size ?? 0), 0),
      };
    } catch (err) {
      console.warn("[PronunciationCache] stats failed", err);
      return { count: 0, approxBytes: 0 };
    }
  }

  /** Keeps the cache from growing forever by evicting the oldest clips past MAX_ENTRIES. */
  private async enforceCapAsync(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const countReq = await promisifyRequest<number>(store.count());
      if (countReq <= MAX_ENTRIES) return;

      const toDelete = countReq - MAX_ENTRIES;
      const index = store.index("createdAt");
      let deleted = 0;
      await new Promise<void>((resolve, reject) => {
        const cursorReq = index.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (!cursor || deleted >= toDelete) {
            resolve();
            return;
          }
          cursor.delete();
          deleted++;
          cursor.continue();
        };
        cursorReq.onerror = () => reject(cursorReq.error ?? new Error("Eviction scan failed"));
      });
    } catch (err) {
      console.warn("[PronunciationCache] eviction failed (non-fatal)", err);
    }
  }
}

export const audioCacheStore = new AudioCacheStore();
