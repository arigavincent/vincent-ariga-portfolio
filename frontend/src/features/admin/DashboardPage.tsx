import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

import { adminApi } from '@/api/admin';

import { adminKeys } from './adminKeys';
import { PageHeader } from './PageHeader';
import { useSession } from './useSession';

interface TileProps {
  label: string;
  to: string;
  value: number | undefined;
  /** Draw attention to the tile, used for unread messages. */
  highlight?: boolean;
}

function Tile({ label, to, value, highlight }: TileProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-6 rounded-card border border-ink-700 bg-ink-850 p-6 transition-colors hover:border-gold-400/60"
    >
      <span className="flex items-center justify-between font-mono text-xs tracking-overline text-gold-400 uppercase">
        {label}
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 text-warm-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
      <span
        className={`font-display text-h2 font-extrabold ${highlight ? 'text-orange-500' : 'text-white'}`}
      >
        {value ?? '–'}
      </span>
    </Link>
  );
}

/** A count of everything on the site, each linking to where it is edited. */
export function DashboardPage() {
  const { user } = useSession();
  const projects = useQuery({
    queryKey: adminKeys.resource('projects'),
    queryFn: adminApi.projects.list,
  });
  const skills = useQuery({
    queryKey: adminKeys.resource('skills'),
    queryFn: adminApi.skills.list,
  });
  const services = useQuery({
    queryKey: adminKeys.resource('services'),
    queryFn: adminApi.services.list,
  });
  const posts = useQuery({ queryKey: adminKeys.resource('blog'), queryFn: adminApi.blog.list });
  const unread = useQuery({
    queryKey: adminKeys.unreadCount,
    queryFn: adminApi.messages.unreadCount,
  });
  const drafts = projects.data?.filter((project) => project.status === 'DRAFT').length ?? 0;
  const unreadCount = unread.data?.unread;

  return (
    <>
      <PageHeader
        title={`Welcome back${user ? `, ${user.username}` : ''}.`}
        description="Everything on the site is edited from here. Changes are live as soon as they are saved."
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Tile
          label="Unread messages"
          to="/admin/messages"
          value={unreadCount}
          highlight={(unreadCount ?? 0) > 0}
        />
        <Tile label="Projects" to="/admin/projects" value={projects.data?.length} />
        <Tile label="Skills" to="/admin/skills" value={skills.data?.length} />
        <Tile label="Services" to="/admin/services" value={services.data?.length} />
        <Tile label="Blog posts" to="/admin/blog" value={posts.data?.length} />
        <Tile
          label="Project drafts"
          to="/admin/projects"
          value={projects.data ? drafts : undefined}
        />
      </div>
    </>
  );
}
