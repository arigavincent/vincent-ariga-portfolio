import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus } from 'lucide-react';
import type { FieldValues } from 'react-hook-form';
import { Link, useLocation } from 'react-router';

import { ApiError } from '@/api/client';
import { Button, QueryContent, Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';

import { adminKeys } from './adminKeys';
import { ConfirmButton } from './ConfirmButton';
import { PageHeader } from './PageHeader';
import type { ResourceConfig } from './resourceConfig';

interface ResourceListPageProps<T extends { id: number }, V extends FieldValues, Input> {
  config: ResourceConfig<T, V, Input>;
}

function notice(state: unknown): string | null {
  return typeof state === 'object' &&
    state !== null &&
    'notice' in state &&
    typeof state.notice === 'string'
    ? state.notice
    : null;
}

/** The table of one content type, with links to create and edit and a two-step delete. */
export function ResourceListPage<T extends { id: number }, V extends FieldValues, Input>({
  config,
}: ResourceListPageProps<T, V, Input>) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const savedNotice = notice(location.state);
  const query = useQuery({ queryKey: adminKeys.resource(config.path), queryFn: config.api.list });
  const remove = useMutation({
    mutationFn: config.api.remove,
    // The public site reads the same content, so its cached copies are refreshed too.
    onSuccess: () => queryClient.invalidateQueries(),
  });

  return (
    <>
      <PageHeader
        title={config.title}
        actions={
          <Button to={`/admin/${config.path}/new`}>
            <span className="flex items-center gap-2">
              <Plus aria-hidden="true" className="size-4" />
              New {config.singular}
            </span>
          </Button>
        }
      />

      {savedNotice ? (
        <p
          role="status"
          className="mb-6 rounded-xl border border-gold-400/40 bg-ink-850 px-4 py-3 text-sm text-gold-300"
        >
          {savedNotice}
        </p>
      ) : null}
      {remove.isError ? (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-orange-500/50 bg-ink-850 px-4 py-3 text-sm text-orange-400"
        >
          {remove.error instanceof ApiError
            ? remove.error.message
            : 'That could not be deleted. Please try again.'}
        </p>
      ) : null}

      <QueryContent
        query={query}
        label={config.title.toLowerCase()}
        skeleton={<Skeleton className="h-64 rounded-card" />}
        empty={
          <div className="rounded-card border border-ink-700 bg-ink-850 p-8">
            <p className="font-display text-xl font-bold">Nothing here yet.</p>
            <p className="mt-2 text-sm text-muted">
              Create the first {config.singular} to see it on the site.
            </p>
          </div>
        }
      >
        {(items) => (
          <div className="overflow-x-auto rounded-card border border-ink-700 bg-ink-850">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-ink-700 font-mono text-xs tracking-overline text-gold-400 uppercase">
                <tr>
                  {config.columns.map((column) => (
                    <th
                      key={column.header}
                      scope="col"
                      className={cn(
                        'px-5 py-4 font-medium',
                        column.secondary && 'hidden md:table-cell',
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                  <th scope="col" className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-ink-700 last:border-b-0">
                    {config.columns.map((column, index) => (
                      <td
                        key={column.header}
                        className={cn(
                          'px-5 py-4 align-middle',
                          index === 0 ? 'font-medium text-white' : 'text-muted',
                          column.secondary && 'hidden md:table-cell',
                        )}
                      >
                        {column.cell(item)}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/${config.path}/${item.id}`}
                          aria-label={`Edit ${config.describe(item)}`}
                          className="inline-flex h-9 items-center gap-2 rounded-full border border-ink-600 px-3 text-sm font-medium text-muted transition-colors hover:border-gold-400 hover:text-gold-300"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                          Edit
                        </Link>
                        <ConfirmButton
                          subject={config.describe(item)}
                          disabled={remove.isPending}
                          onConfirm={() => {
                            remove.mutate(item.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryContent>
    </>
  );
}
