import { homeSections } from '@/lib/site';

export interface NavItem {
  label: string;
  /** Router target: a home-page section hash or a page path. */
  to: { pathname: string; hash?: string };
}

/** Primary navigation: the home sections (contact is the call to action) plus the work index. */
export const navItems: NavItem[] = homeSections
  .filter((section) => section.id !== 'contact')
  .map((section) => ({ label: section.label, to: { pathname: '/', hash: `#${section.id}` } }));

export const contactTarget = { pathname: '/', hash: '#contact' };
