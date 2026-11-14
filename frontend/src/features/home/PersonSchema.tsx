import { useQuery } from '@tanstack/react-query';

import { queries } from '@/api/public';
import { useSettings } from '@/hooks/useSettings';
import { siteUrl } from '@/lib/siteUrl';

/**
 * schema.org Person data for search engines, built from the site settings. The only profile
 * listed under sameAs is GitHub.
 */
export function PersonSchema() {
  const settings = useSettings();
  const { data: education } = useQuery(queries.education());
  const school = education?.[0]?.institution;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings.displayName,
    jobTitle: settings.role,
    description: settings.seoDescription,
    url: siteUrl(),
    email: `mailto:${settings.email}`,
    address: { '@type': 'PostalAddress', addressCountry: 'KE' },
    sameAs: [settings.githubUrl],
    ...(school ? { alumniOf: { '@type': 'CollegeOrUniversity', name: school } } : {}),
  };

  // "<" is escaped so the JSON can never close the script element early.
  const json = JSON.stringify(person).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
