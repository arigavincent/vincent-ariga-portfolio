import { LoaderCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { auth } from '@/api/auth';

import { useSession } from './useSession';

/**
 * Guards the admin area. On first load it tries to restore the session from the refresh cookie;
 * visitors without one are sent to the sign-in page and brought back afterwards.
 */
export function RequireAuth() {
  const { status } = useSession();
  const location = useLocation();

  useEffect(() => {
    if (status === 'checking') {
      void auth.refresh();
    }
  }, [status]);

  if (status === 'checking') {
    return (
      <div
        role="status"
        aria-label="Checking your session"
        className="grid min-h-dvh place-items-center bg-ink-900"
      >
        <LoaderCircle aria-hidden="true" className="size-8 animate-spin text-gold-400" />
      </div>
    );
  }
  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
