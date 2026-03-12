import { useState, useEffect, useCallback } from 'react';
import { storage } from '../lib/storage';

/**
 * Syncs a piece of state bidirectionally with AsyncStorage.
 * The value is loaded once on mount; writes persist automatically.
 */
export const usePersistedState = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    storage.get<T>(key).then(stored => {
      if (stored !== null) setValue(stored);
      setHydrated(true);
    });
  }, [key]);

  const persist = useCallback(
    async (next: T | ((prev: T) => T)) => {
      setValue(prev => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        storage.set(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, persist, hydrated] as const;
};
