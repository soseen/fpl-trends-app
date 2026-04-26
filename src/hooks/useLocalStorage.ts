import { useCallback, useEffect, useState } from "react";

type SetValue<T> = (value: T | null) => void;

/**
 * Generic localStorage-backed state hook. Returns [value, setValue, clear].
 * Setting `null` removes the key.
 *
 * Reads on mount only — does not subscribe to cross-tab "storage" events,
 * which is fine for our use case (a per-user FPL ID).
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T | null = null,
): [T | null, SetValue<T>, () => void] {
  const [value, setValueState] = useState<T | null>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback<SetValue<T>>(
    (next) => {
      setValueState(next);
      try {
        if (next === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(next));
        }
      } catch {
        /* quota / private mode — ignore */
      }
    },
    [key],
  );

  const clear = useCallback(() => setValue(null), [setValue]);

  useEffect(() => {
    // No-op effect to keep the hook deps stable across re-renders.
  }, [key]);

  return [value, setValue, clear];
}
