import { motion } from 'motion/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const easeInOutQuart = [0.76, 0, 0.24, 1] as const;

/**
 * Unmasks its content from the bottom up while the content settles from a slight zoom: the
 * classic image reveal. Wrap an <img> or any visual block.
 */
export function ImageReveal({ children, className, delay = 0 }: ImageRevealProps) {
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, delay, ease: easeInOutQuart }}
    >
      <motion.div
        className="size-full"
        initial={{ scale: 1.25 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.4, delay, ease: easeInOutQuart }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
