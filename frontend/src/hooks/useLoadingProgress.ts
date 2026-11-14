import { useSyncExternalStore } from 'react';

import { loading, type LoadingSnapshot } from '@/lib/loading';

export function useLoadingProgress(): LoadingSnapshot {
  return useSyncExternalStore(loading.subscribe, loading.getSnapshot, loading.getSnapshot);
}
