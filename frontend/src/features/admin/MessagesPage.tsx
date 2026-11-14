import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, Mail, MailOpen } from 'lucide-react';
import { useState } from 'react';

import { adminApi } from '@/api/admin';
import type { ContactMessage, ContactStatus } from '@/api/types';
import { Skeleton } from '@/components/ui';
import { buttonClasses } from '@/components/ui/buttonClasses';
import { cn } from '@/lib/cn';
import { formatLongDate } from '@/lib/format';

import { adminKeys } from './adminKeys';
import { ConfirmButton } from './ConfirmButton';
import { PageHeader } from './PageHeader';
import { StatusBadge } from './StatusBadge';

const filters: { label: string; status: ContactStatus | undefined }[] = [
  { label: 'All', status: undefined },
  { label: 'New', status: 'NEW' },
  { label: 'Read', status: 'READ' },
  { label: 'Archived', status: 'ARCHIVED' },
];

const statusLabels: Record<ContactStatus, string> = {
  NEW: 'New',
  READ: 'Read',
  ARCHIVED: 'Archived',
};

interface MessageDetailProps {
  message: ContactMessage;
  busy: boolean;
  onStatus: (status: ContactStatus) => void;
  onDelete: () => void;
}

function MessageDetail({ message, busy, onStatus, onDelete }: MessageDetailProps) {
  const subject = message.subject ?? 'Your message';
  const actionClasses = buttonClasses({ variant: 'secondary', className: 'h-9 px-3 text-sm' });

  return (
    <article aria-label={`Message from ${message.name}`} className="flex flex-col gap-6 p-6 sm:p-8">
      <header className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold">{message.subject ?? 'No subject'}</h2>
        <p className="text-sm text-white">
          {message.name} ·{' '}
          <a
            href={`mailto:${message.email}`}
            className="text-orange-400 underline-offset-4 hover:underline"
          >
            {message.email}
          </a>
        </p>
        <p className="font-mono text-xs text-warm-300">
          <time dateTime={message.createdAt}>{formatLongDate(message.createdAt)}</time>
        </p>
      </header>

      <p className="whitespace-pre-wrap text-muted">{message.message}</p>

      <div className="flex flex-wrap items-center gap-3 border-t border-ink-700 pt-6">
        <a
          href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`}
          className={buttonClasses({ className: 'h-9 px-4 text-sm' })}
        >
          <Mail aria-hidden="true" className="size-4" />
          Reply by email
        </a>
        {message.status === 'ARCHIVED' ? (
          <button
            type="button"
            disabled={busy}
            className={actionClasses}
            onClick={() => {
              onStatus('READ');
            }}
          >
            <MailOpen aria-hidden="true" className="size-4" />
            Move to inbox
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            className={actionClasses}
            onClick={() => {
              onStatus('ARCHIVED');
            }}
          >
            <Archive aria-hidden="true" className="size-4" />
            Archive
          </button>
        )}
        {message.status === 'READ' ? (
          <button
            type="button"
            disabled={busy}
            className={actionClasses}
            onClick={() => {
              onStatus('NEW');
            }}
          >
            Mark as unread
          </button>
        ) : null}
        <ConfirmButton
          subject={`the message from ${message.name}`}
          disabled={busy}
          onConfirm={onDelete}
        />
      </div>
    </article>
  );
}

/** The contact inbox: filter by status, open a message (which marks it read), archive or delete. */
export function MessagesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ContactStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);

  const messages = useQuery({
    queryKey: adminKeys.messages(status, page),
    queryFn: () => adminApi.messages.list({ status, page }),
    placeholderData: keepPreviousData,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminKeys.allMessages });
  const changeStatus = useMutation({
    mutationFn: ({ id, next }: { id: number; next: ContactStatus }) =>
      adminApi.messages.setStatus(id, next),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: adminApi.messages.remove,
    onSuccess: () => {
      setOpenId(null);
      return refresh();
    },
  });

  const open = messages.data?.content.find((message) => message.id === openId) ?? null;
  const busy = changeStatus.isPending || remove.isPending;

  function handleOpen(message: ContactMessage) {
    setOpenId(message.id);
    if (message.status === 'NEW') {
      changeStatus.mutate({ id: message.id, next: 'READ' });
    }
  }

  return (
    <>
      <PageHeader title="Inbox" description="Messages sent through the contact form." />

      <div role="group" aria-label="Filter messages" className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            aria-pressed={filter.status === status}
            onClick={() => {
              setStatus(filter.status);
              setPage(0);
              setOpenId(null);
            }}
            className={cn(
              'h-9 rounded-full border px-4 text-sm font-medium transition-colors',
              filter.status === status
                ? 'border-orange-500 bg-orange-500 text-ink-950'
                : 'border-ink-600 text-muted hover:border-gold-400 hover:text-white',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {messages.isPending ? (
        <div role="status" aria-label="Loading messages">
          <Skeleton className="h-80 rounded-card" />
        </div>
      ) : messages.isError ? (
        <p role="alert" className="text-muted">
          The inbox could not be loaded. Refresh the page to try again.
        </p>
      ) : messages.data.content.length === 0 ? (
        <div className="rounded-card border border-ink-700 bg-ink-850 p-8">
          <p className="font-display text-xl font-bold">No messages here.</p>
          <p className="mt-2 text-sm text-muted">
            New messages from the contact form will show up in this list.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_1fr]">
          <div className="flex flex-col gap-4">
            <ul
              aria-label="Messages"
              className="overflow-hidden rounded-card border border-ink-700 bg-ink-850"
            >
              {messages.data.content.map((message) => (
                <li key={message.id} className="border-b border-ink-700 last:border-b-0">
                  <button
                    type="button"
                    aria-current={message.id === openId ? 'true' : undefined}
                    onClick={() => {
                      handleOpen(message);
                    }}
                    className={cn(
                      'flex w-full flex-col gap-1.5 px-5 py-4 text-left transition-colors hover:bg-ink-800',
                      message.id === openId && 'bg-ink-800',
                    )}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span
                        className={cn(
                          'flex items-center gap-2 truncate text-sm',
                          message.status === 'NEW'
                            ? 'font-bold text-white'
                            : 'font-medium text-muted',
                        )}
                      >
                        {message.status === 'NEW' ? (
                          <span
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full bg-orange-500"
                          />
                        ) : null}
                        {message.name}
                      </span>
                      <StatusBadge tone={message.status === 'NEW' ? 'live' : 'quiet'}>
                        {statusLabels[message.status]}
                      </StatusBadge>
                    </span>
                    <span className="truncate text-sm text-white">
                      {message.subject ?? 'No subject'}
                    </span>
                    <span className="truncate text-xs text-warm-300">{message.message}</span>
                  </button>
                </li>
              ))}
            </ul>

            {messages.data.totalPages > 1 ? (
              <nav
                aria-label="Pages"
                className="flex items-center justify-between gap-4 text-sm text-muted"
              >
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => {
                    setPage(page - 1);
                  }}
                  className="rounded-full border border-ink-600 px-4 py-1.5 transition-colors hover:border-gold-400 disabled:opacity-40"
                >
                  Newer
                </button>
                <span>
                  Page {page + 1} of {messages.data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page + 1 >= messages.data.totalPages}
                  onClick={() => {
                    setPage(page + 1);
                  }}
                  className="rounded-full border border-ink-600 px-4 py-1.5 transition-colors hover:border-gold-400 disabled:opacity-40"
                >
                  Older
                </button>
              </nav>
            ) : null}
          </div>

          <div className="rounded-card border border-ink-700 bg-ink-850">
            {open ? (
              <MessageDetail
                message={open}
                busy={busy}
                onStatus={(next) => {
                  changeStatus.mutate({ id: open.id, next });
                }}
                onDelete={() => {
                  remove.mutate(open.id);
                }}
              />
            ) : (
              <p className="p-8 text-sm text-muted">Choose a message to read it.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
