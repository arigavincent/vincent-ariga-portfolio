import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';

interface ConfirmButtonProps {
  /** What is being removed, for the accessible name: "Delete AJ Stream". */
  subject: string;
  onConfirm: () => void;
  disabled?: boolean;
}

/** Seconds the button stays armed before it resets. */
const ARMED_FOR_MS = 4000;

/**
 * A delete button that needs two presses: the first arms it and changes its label, the second
 * within a few seconds confirms. It resets on its own, so a stray press does nothing.
 */
export function ConfirmButton({ subject, onConfirm, disabled }: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setArmed(false);
    }, ARMED_FOR_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [armed]);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={armed ? `Confirm deleting ${subject}` : `Delete ${subject}`}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors disabled:opacity-50',
        armed
          ? 'border-orange-500 bg-orange-500 text-ink-950'
          : 'border-ink-600 text-muted hover:border-orange-500 hover:text-orange-400',
      )}
    >
      <Trash2 aria-hidden="true" className="size-4" />
      {armed ? 'Confirm' : 'Delete'}
    </button>
  );
}
