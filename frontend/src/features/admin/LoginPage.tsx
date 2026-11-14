import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoaderCircle, LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';

import { auth } from '@/api/auth';
import { ApiError } from '@/api/client';
import { Button, TextField } from '@/components/ui';

import { useSession } from './useSession';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
});

type LoginValues = z.infer<typeof loginSchema>;

function describeFailure(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'That username or password is not right.';
    }
    if (error.status === 429) {
      return 'Too many attempts. Wait a few minutes and try again.';
    }
    if (error.status === 0) {
      return error.message;
    }
  }
  return 'Could not sign in. Please try again.';
}

function destination(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string'
  ) {
    return state.from;
  }
  return '/admin';
}

export function LoginPage() {
  const { status } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const target = destination(location.state);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  // An existing session (from the refresh cookie) skips the form.
  useEffect(() => {
    if (status === 'checking') {
      void auth.refresh();
    }
  }, [status]);

  const login = useMutation({
    mutationFn: ({ username, password }: LoginValues) => auth.login(username, password),
    onSuccess: () => navigate(target, { replace: true }),
  });

  if (status === 'authenticated') {
    return <Navigate to={target} replace />;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-ink-900 px-5 py-12">
      <title>Sign in | Vincent Ariga · A&amp;J</title>
      <meta name="robots" content="noindex, nofollow" />

      <div className="w-full max-w-md gradient-border rounded-card p-8 sm:p-10">
        <p className="font-display text-2xl font-extrabold">
          A<span className="text-orange-500">&amp;</span>J
        </p>
        <h1 className="mt-6 font-display text-h3 font-extrabold">Sign in</h1>
        <p className="mt-2 text-sm text-muted">The admin area for this portfolio.</p>

        <form
          noValidate
          className="mt-8 flex flex-col gap-5"
          onSubmit={(event) => {
            void handleSubmit((values) => {
              login.mutate(values);
            })(event);
          }}
        >
          <TextField
            label="Username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            error={errors.username?.message}
            {...register('username')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {login.isError ? (
            <p role="alert" className="text-sm text-orange-400">
              {describeFailure(login.error)}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={login.isPending} className="mt-2 w-full">
            <span className="flex items-center gap-2">
              {login.isPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <LogIn aria-hidden="true" className="size-4" />
              )}
              {login.isPending ? 'Signing in' : 'Sign in'}
            </span>
          </Button>
        </form>
      </div>
    </main>
  );
}
