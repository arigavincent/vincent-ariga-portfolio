import type { ContactStatus } from '@/api/types';

/** Query keys for admin data, in one place so mutations invalidate exactly what they change. */
export const adminKeys = {
  resource: (path: string) => ['admin', path] as const,
  item: (path: string, id: number) => ['admin', path, id] as const,
  settings: ['admin', 'settings'] as const,
  messages: (status: ContactStatus | undefined, page: number) =>
    ['admin', 'messages', status ?? 'ALL', page] as const,
  allMessages: ['admin', 'messages'] as const,
  unreadCount: ['admin', 'messages', 'unread-count'] as const,
};
