import { motion } from 'motion/react';
import type { ElementType } from 'react';

import { cn } from '@/lib/cn';

interface SplitTextProps {
  /** The text to reveal. Line breaks ("\n") are kept. */
  text: string;
  /** Element to render, so headings stay headings. */
  as?: ElementType;
  className?: string;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
  /** Animate when mounted instead of when scrolled into view (for above-the-fold text). */
  immediate?: boolean;
  id?: string;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/**
 * Reveals text word by word, each word rising from behind a mask. Screen readers get the plain
 * text through aria-label; the animated word spans are hidden from them.
 */
export function SplitText({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  stagger = 0.045,
  immediate = false,
  id,
}: SplitTextProps) {
  const lines = text.split('\n').map((line) => line.split(' ').filter(Boolean));
  let wordIndex = 0;
  const visibility = immediate
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, margin: '0px 0px -10% 0px' } };

  return (
    <Tag id={id} className={cn('block', className)} aria-label={text.replace(/\n/g, ' ')}>
      {lines.map((words, lineIndex) => (
        <span key={lineIndex} className="block" aria-hidden="true">
          {words.map((word) => {
            const index = wordIndex++;
            return (
              <span
                key={index}
                className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
              >
                <motion.span
                  className="inline-block will-change-transform"
                  initial="hidden"
                  {...visibility}
                  variants={{
                    hidden: { y: '115%' },
                    visible: {
                      y: '0%',
                      transition: {
                        duration: 1,
                        delay: delay + index * stagger,
                        ease: easeOutExpo,
                      },
                    },
                  }}
                >
                  {word}
                </motion.span>
                {' '}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
