import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'lg';

interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const base =
  'group/button relative inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap ' +
  'transition-[background-color,color,border-color,box-shadow] duration-300 ease-out-expo ' +
  'disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  // Dark ink on orange: white on orange fails WCAG AA (3.0:1), ink passes (5.6:1).
  primary: 'bg-orange-500 text-ink-950 hover:bg-orange-400 hover:shadow-glow active:bg-orange-600',
  secondary:
    'border border-ink-600 bg-ink-900/40 text-white backdrop-blur-sm hover:border-gold-400 hover:text-gold-300',
  ghost: 'text-white underline-offset-8 hover:text-orange-400 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-base',
};

/** Class names for anything that should look like a button. */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: ButtonClassOptions = {}): string {
  return cn(base, variants[variant], variant === 'ghost' ? 'h-auto px-0' : sizes[size], className);
}
