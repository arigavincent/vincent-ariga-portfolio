import { useQuery } from '@tanstack/react-query';
import {
  Briefcase,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Settings,
  Sparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router';

import { adminApi } from '@/api/admin';
import { auth } from '@/api/auth';
import { cn } from '@/lib/cn';

import { adminKeys } from './adminKeys';
import { useSession } from './useSession';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/skills', label: 'Skills', icon: Wrench },
  { to: '/admin/experience', label: 'Experience', icon: Briefcase },
  { to: '/admin/education', label: 'Education', icon: GraduationCap },
  { to: '/admin/services', label: 'Services', icon: Sparkles },
  { to: '/admin/blog', label: 'Blog', icon: NotebookPen },
  { to: '/admin/messages', label: 'Inbox', icon: Inbox },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

/** The admin shell: navigation (a sidebar on desktop, a scrolling bar on phones) and the page. */
export function AdminLayout() {
  const { user } = useSession();
  const navigate = useNavigate();
  const { data: unread } = useQuery({
    queryKey: adminKeys.unreadCount,
    queryFn: adminApi.messages.unreadCount,
    refetchInterval: 60_000,
  });

  async function handleLogout() {
    await auth.logout();
    await navigate('/admin/login', { replace: true });
  }

  return (
    <div className="min-h-dvh bg-ink-900 lg:grid lg:grid-cols-[16rem_1fr]">
      <title>Admin | Vincent Ariga · A&amp;J</title>
      <meta name="robots" content="noindex, nofollow" />

      <aside className="border-b border-ink-700 bg-ink-950 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:py-6">
          <p className="font-display text-lg font-extrabold">
            A<span className="text-orange-500">&amp;</span>J{' '}
            <span className="font-mono text-xs font-medium text-warm-300">admin</span>
          </p>
          <a
            href="/"
            className="flex items-center gap-1.5 font-mono text-xs text-warm-300 transition-colors hover:text-gold-300"
          >
            View site
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        </div>

        <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:flex-1 lg:overflow-y-auto">
          <ul className="flex gap-1 lg:flex-col">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
                      isActive
                        ? 'bg-ink-800 text-white'
                        : 'text-muted hover:bg-ink-850 hover:text-white',
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  {label}
                  {label === 'Inbox' && unread && unread.unread > 0 ? (
                    <span
                      className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 font-mono text-xs font-semibold text-ink-950"
                      aria-label={`${unread.unread} unread`}
                    >
                      {unread.unread}
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center justify-between gap-3 border-t border-ink-700 px-5 py-4 lg:flex">
          <p className="truncate font-mono text-xs text-warm-300">{user?.username}</p>
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-orange-400"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mb-6 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-orange-400"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
