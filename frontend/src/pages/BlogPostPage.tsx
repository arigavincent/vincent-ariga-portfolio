import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ApiError } from '@/api/client';
import { queries } from '@/api/public';
import { Button, Section, Skeleton, SplitText, Tag } from '@/components/ui';
import { Markdown } from '@/features/blog/Markdown';
import { useSettings } from '@/hooks/useSettings';
import { formatLongDate } from '@/lib/format';

import { NotFoundPage } from './NotFoundPage';

export function BlogPostPage() {
  const { slug = '' } = useParams();
  const settings = useSettings();
  const { data: post, error, isPending, refetch } = useQuery(queries.blogPost(slug));

  if (error instanceof ApiError && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <Section className="pt-40">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="mb-12 inline-flex items-center gap-2 font-mono text-xs tracking-overline text-gold-400 uppercase transition-colors hover:text-gold-300"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All posts
        </Link>

        {isPending ? (
          <div role="status" aria-label="Loading post" className="flex flex-col gap-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-start gap-4">
            <p className="text-muted">Could not load this post right now.</p>
            <Button
              variant="secondary"
              onClick={() => {
                void refetch();
              }}
            >
              Try again
            </Button>
          </div>
        ) : (
          <article className="flex flex-col gap-10">
            <title>{`${post.title} | ${settings.displayName} · ${settings.brandMark}`}</title>
            <meta name="description" content={post.excerpt} />

            <header className="flex flex-col gap-6">
              {post.publishedAt ? (
                <p className="eyebrow">
                  <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
                </p>
              ) : null}
              <SplitText
                as="h1"
                immediate
                text={post.title}
                className="font-display text-h1 font-extrabold"
              />
              <p className="text-lead text-white">{post.excerpt}</p>
              {post.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Tag>{tag}</Tag>
                    </li>
                  ))}
                </ul>
              ) : null}
            </header>

            <Markdown>{post.content}</Markdown>
          </article>
        )}
      </div>
    </Section>
  );
}
