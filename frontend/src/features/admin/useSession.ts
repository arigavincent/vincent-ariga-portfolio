import { useSyncExternalStore } from 'react';

import { auth, type Session } from '@/api/auth';

export function useSession(): Session {
  return useSyncExternalStore(auth.subscribe, auth.getSession, auth.getSession);
}
