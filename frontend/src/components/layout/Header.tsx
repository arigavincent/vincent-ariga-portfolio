import { Menu } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';

import { MagneticButton } from '@/components/ui';
import { cn } from '@/lib/cn';

import { BrandMark } from './BrandMark';
import { MobileMenu } from './MobileMenu';
import { contactTarget, navItems } from './navigation';

/** Pixels scrolled before the header gains its backdrop. */
const SOLID_AFTER = 24;
/** Pixels scrolled before the header may hide on the way down. */
const HIDE_AFTER = 480;

/**
 * Fixed site header. Transparent over the hero, frosted once the page scrolls, and it steps out
 * of the way while scrolling down, returning as soon as the visitor scrolls up.
 */
export function Header() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setSolid(current > SOLID_AFTER);
    setHidden(current > HIDE_AFTER && current > previous);
  });

  return (
    <>
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-500',
          solid
            ? 'border-ink-700 bg-ink-900/75 backdrop-blur-xl'
            : 'border-transparent bg-transparent',
        )}
        animate={{ y: hidden && !menuOpen ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-page flex h-20 items-center justify-between gap-6">
          <BrandMark />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => {
                const active =
                  location.pathname === item.to.pathname && location.hash === item.to.hash;
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      aria-current={active ? 'location' : undefined}
                      className={cn(
                        'group relative py-2 text-sm font-medium transition-colors duration-300 hover:text-white',
                        active ? 'text-white' : 'text-muted',
                      )}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-x-0 -bottom-0.5 h-px origin-left bg-orange-500 transition-transform duration-500 ease-out-expo group-hover:scale-x-100',
                          active ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <MagneticButton to={contactTarget} arrow>
                Let&rsquo;s talk
              </MagneticButton>
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              className="grid size-11 place-items-center rounded-full border border-ink-600 text-white transition-colors hover:border-gold-400 lg:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => {
                setMenuOpen(true);
              }}
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }}
      />
    </>
  );
}
