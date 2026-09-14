import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  children: ReactNode;
  labelId: string;
  onClose?: () => void;
  className?: string;
}

export default function Modal({ children, labelId, onClose, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstFocusable = dialog?.querySelector<HTMLElement>(focusableSelector);
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onCloseRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={event => {
      if (event.target === event.currentTarget && onClose) onClose();
    }}>
      <div
        ref={dialogRef}
        className={`modal-sheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
      >
        {children}
      </div>
    </div>
  );
}
