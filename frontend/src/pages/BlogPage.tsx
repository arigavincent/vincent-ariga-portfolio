import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';

import { queries } from '@/api/public';
import { Heading, QueryContent, Reveal, Section, Skeleton, Tag } from '@/components/ui';
import { useSettings } from '@/hooks/useSettings';
import { formatLongDate } from '@/lib/format';

export function BlogPage() {
  const settings = useSettings();
  const query = useQuery(queries.blogPosts());

  return (
    <>
      <title>{`Blog | ${settings.displayName} · ${settings.brandMark}`}</title>
      <meta
        name="description"
        content={`Notes on backend engineering by ${settings.displayName}.`}
      />
      <Section className="pt-40">
        <Heading
          level="h1"
          overline="Blog"
          title="Notes from the backend."
          lead="Things I learn while building, written down so I remember them."
        />

        <div className="mt-16">
          <QueryContent
            query={query}
            label="posts"
            skeleton={
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-36" />
                ))}
              </div>
            }
            empty={
              <div className="rounded-card border border-ink-700 bg-ink-850 p-8 sm:p-12">
                <p className="font-display text-h3 font-extrabold">Nothing published yet.</p>
                <p className="mt-3 max-w-md text-muted">
                  The first post is still being written. In the meantime, the projects say more than
                  a post would.
                </p>
              </div>
            }
          >
            {(posts) => (
              <ul className="border-t border-ink-700">
                {posts.map((post) => (
                  <li key={post.id} className="border-b border-ink-700">
                    <Reveal>
                      <Link
                        to={`/blog/${post.slug}`}
                        data-cursor-label="Read"
                        className="group grid gap-4 py-10 md:grid-cols-[12rem_1fr_auto] md:gap-10"
                      >
                        <span className="font-mono text-sm text-warm-300">
                          {post.publishedAt ? formatLongDate(post.publishedAt) : null}
                        </span>
                        <span className="flex flex-col gap-3">
                          <span className="font-display text-h3 font-extrabold transition-colors duration-300 group-hover:text-orange-400">
                            {post.title}
                          </span>
                          <span className="max-w-2xl text-muted">{post.excerpt}</span>
                          {post.tags.length > 0 ? (
                            <span className="flex flex-wrap gap-2">
                              {post.tags.map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                              ))}
                            </span>
                          ) : null}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-6 text-warm-300 transition-all duration-500 ease-out-expo group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-orange-500"
                        />
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
          </QueryContent>
        </div>
      </Section>
    </>
  );
}
