import { ArrowUpRight } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses';

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows an arrow that nudges on hover. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = StyleProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof StyleProps> & { to?: never; href?: never };
type ButtonAsLink = StyleProps & Omit<LinkProps, keyof StyleProps> & { href?: never };
type ButtonAsAnchor = StyleProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof StyleProps> & { href: string; to?: never };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

function Content({ arrow, children }: Pick<StyleProps, 'arrow' | 'children'>) {
  return (
    <>
      <span>{children}</span>
      {arrow ? (
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
        />
      ) : null}
    </>
  );
}

/**
 * The site's button. Renders a router link when given `to`, an anchor when given `href`, and a
 * native button otherwise, so the right element is always used for the job.
 */
export function Button(props: ButtonProps) {
  const { variant, size, arrow, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, className });
  const content = <Content arrow={arrow}>{children}</Content>;

  if ('to' in rest && rest.to !== undefined) {
    return (
      <Link className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if ('href' in rest && rest.href !== undefined) {
    const external = /^https?:\/\//.test(rest.href);
    return (
      <a
        className={classes}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
