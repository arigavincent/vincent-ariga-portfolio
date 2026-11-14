/** The site's public origin without a trailing slash: the configured one, or wherever it is being served. */
export function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim();
  const origin =
    configured === undefined || configured === '' ? window.location.origin : configured;
  return origin.replace(/\/+$/, '');
}
