import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { Link } from 'react-router';

import { Button } from '@/components/ui';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useSettings } from '@/hooks/useSettings';

import { BrandMark } from './BrandMark';
import { contactTarget, navItems } from './navigation';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled])';

/** Full-screen navigation for small screens: a modal dialog with focus kept inside it. */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const settings = useSettings();
  useScrollLock(open);

  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) {
      return;
    }
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[70] flex flex-col bg-ink-950"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          onKeyDown={handleKeyDown}
        >
          <div className="container-page flex h-20 shrink-0 items-center justify-between">
            <BrandMark onNavigate={onClose} />
            <button
              type="button"
              data-autofocus
              className="grid size-11 place-items-center rounded-full border border-ink-600 text-white transition-colors hover:border-gold-400"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <nav
            aria-label="Mobile"
            className="container-page flex flex-1 flex-col justify-center overflow-y-auto py-8"
          >
            <ul className="flex flex-col gap-2">
              {navItems.map((item, index) => (
                <li key={item.label} className="overflow-hidden">
                  <motion.div
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.8, delay: 0.15 + index * 0.06, ease: easeOutExpo }}
                  >
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className="flex items-baseline gap-4 py-2 font-display text-h1 font-extrabold transition-colors hover:text-orange-500"
                    >
                      <span className="font-mono text-xs font-medium tracking-overline text-gold-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {item.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="container-page flex shrink-0 flex-col gap-5 border-t border-ink-700 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button to={contactTarget} size="lg" arrow onClick={onClose} className="w-full">
              Let&rsquo;s talk
            </Button>
            <p className="eyebrow">{settings.tagline}</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
