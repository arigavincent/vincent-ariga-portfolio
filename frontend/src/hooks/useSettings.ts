import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import type { SiteSettings } from '@/api/types';
import { fallbackSettings } from '@/lib/site';

/** Site settings, falling back to the built-in identity while loading or when the API is down. */
export function useSettings(): SiteSettings {
  const { data } = useQuery(queries.settings());
  return data ?? fallbackSettings;
}
