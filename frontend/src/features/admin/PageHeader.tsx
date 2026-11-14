import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Buttons or links shown beside the title. */
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-h3 font-extrabold">{title}</h1>
        {description ? <p className="max-w-xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}
