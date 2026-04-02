import { useEffect, useRef, useState } from "react";
import { APP_DB_NAME, APP_DB_STORE, APP_DB_VERSION } from "../domain/constants";

type StoredRecord<T> = {
  key: string;
  value: T;
};

function hasIndexedDb() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!hasIndexedDb()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(APP_DB_NAME, APP_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(APP_DB_STORE)) {
        database.createObjectStore(APP_DB_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Nao foi possivel abrir o banco local."));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>
) {
  const database = await openDatabase();
  if (!database) {
    return null;
  }

  try {
    const transaction = database.transaction(APP_DB_STORE, mode);
    const store = transaction.objectStore(APP_DB_STORE);
    return await operation(store);
  } finally {
    database.close();
  }
}

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

async function readIndexedDb<T>(key: string): Promise<T | null> {
  const result = await withStore("readonly", (store) => {
    return new Promise<T | null>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const record = request.result as StoredRecord<T> | undefined;
        resolve(record?.value ?? null);
      };
      request.onerror = () =>
        reject(request.error ?? new Error("Nao foi possivel ler do banco local."));
    });
  });

  return result ?? null;
}

async function writeIndexedDb<T>(key: string, value: T) {
  await withStore("readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key, value } satisfies StoredRecord<T>);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(request.error ?? new Error("Nao foi possivel gravar no banco local."));
    });
  });
}

async function migrateFromLocalStorage<T>(key: string, fallback: T) {
  const legacyValue = readLocalStorage(key, fallback);
  const hasLegacyValue =
    typeof window !== "undefined" && window.localStorage.getItem(key) !== null;

  if (!hasLegacyValue) {
    return fallback;
  }

  await writeIndexedDb(key, legacyValue);
  window.localStorage.removeItem(key);
  return legacyValue;
}

export function usePersistentState<T>(key: string, initialValue: T | (() => T)) {
  const fallbackRef = useRef<T>(
    typeof initialValue === "function" ? (initialValue as () => T)() : initialValue
  );
  const [value, setValue] = useState<T>(fallbackRef.current);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      try {
        const indexedValue = await readIndexedDb<T>(key);
        if (isCancelled) {
          return;
        }

        if (indexedValue !== null) {
          setValue(indexedValue);
        } else {
          const migratedValue = await migrateFromLocalStorage(key, fallbackRef.current);
          if (!isCancelled) {
            setValue(migratedValue);
          }
        }
      } catch {
        if (!isCancelled) {
          setValue(readLocalStorage(key, fallbackRef.current));
        }
      } finally {
        if (!isCancelled) {
          setIsHydrated(true);
        }
      }
    }

    hydrate().catch(() => {
      if (!isCancelled) {
        setIsHydrated(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeIndexedDb(key, value).catch(() => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    });
  }, [isHydrated, key, value]);

  return [value, setValue] as const;
}
