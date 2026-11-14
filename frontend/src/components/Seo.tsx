import { siteUrl } from '@/lib/siteUrl';

interface SeoProps {
  title: string;
  description: string;
  /** Path of this page, starting with "/". Used for the canonical link and og:url. */
  path: string;
  /** Article pages (projects, posts) are typed as such for link previews. */
  type?: 'website' | 'article';
  /** Keep the page out of search results (the 404 page). */
  noIndex?: boolean;
}

/**
 * The document head for a page: title, description, canonical link and the Open Graph and
 * Twitter tags used for link previews. React hoists these into <head>.
 */
export function Seo({ title, description, path, type = 'website', noIndex = false }: SeoProps) {
  const base = siteUrl();
  const url = `${base}${path}`;
  const image = `${base}/og-image.png`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={url} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
}
