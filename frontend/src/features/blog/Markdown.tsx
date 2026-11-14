import ReactMarkdown, { type Components } from 'react-markdown';

interface MarkdownProps {
  children: string;
}

/**
 * How each Markdown element is drawn. Raw HTML in posts is not rendered (react-markdown's
 * default), so a post can never inject markup or scripts.
 */
const components: Components = {
  h1: ({ children }) => <h2 className="mt-12 font-display text-h2 font-extrabold">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-12 font-display text-h3 font-extrabold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 font-display text-xl font-bold">{children}</h3>,
  p: ({ children }) => <p className="text-lead text-muted">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-orange-400 underline underline-offset-4 transition-colors hover:text-orange-500"
      {...(href?.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="flex list-disc flex-col gap-2 pl-6 text-lead text-muted">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="flex list-decimal flex-col gap-2 pl-6 text-lead text-muted">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l border-gold-400 pl-5 text-gold-300">{children}</blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-ink-800 px-1.5 py-0.5 font-mono text-[0.9em] text-gold-300">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-card border border-ink-700 bg-ink-950 p-6 font-mono text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-white">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-6 border-ink-700" />,
  img: ({ src, alt }) => (
    <img src={src} alt={alt ?? ''} loading="lazy" className="rounded-card border border-ink-700" />
  ),
};

/** Renders a blog post's Markdown body in the site's type styles. */
export function Markdown({ children }: MarkdownProps) {
  return (
    <div className="flex flex-col gap-5">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
