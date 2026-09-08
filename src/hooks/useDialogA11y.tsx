/**
 * src/hooks/useDialogA11y.tsx
 * Aksesibilitas dialog modal HAGUMI:
 *  - Focus trap: navigasi Tab dikurung di dalam dialog.
 *  - Escape menutup dialog (opsional — onboarding bisa tanpa Esc).
 *  - Fokus awal ke elemen interaktif pertama di dalam dialog.
 *  - Fokus dikembalikan ke elemen pemicu saat dialog ditutup.
 *
 * Pemakaian:
 *   <DialogA11yWrapper isActive={open} onClose={close} label="Judul Dialog">
 *     <MyModalContent />
 *   </DialogA11yWrapper>
 */

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Hook perilaku dialog. `onClose` disimpan di ref agar identitas inline-nya
 * yang berubah tiap render tidak memicu re-run effect (fokus tidak berantakan).
 */
export function useDialogA11y(isActive: boolean, onClose?: () => void) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isActive) return;
    const container = containerRef.current;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Fokus awal: elemen interaktif pertama, atau container itu sendiri
    const first = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (first) {
      first.focus();
    } else {
      container?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onCloseRef.current) {
          event.preventDefault();
          event.stopPropagation();
          onCloseRef.current();
        }
        return;
      }
      if (event.key !== 'Tab' || !container) return;

      // Focus trap: kurung navigasi Tab di dalam dialog
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = container.contains(active);
      if (event.shiftKey) {
        if (!inside || active === firstEl) {
          event.preventDefault();
          lastEl.focus();
        }
      } else if (!inside || active === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      // Kembalikan fokus ke elemen pemicu (jika masih terhubung ke dokumen)
      const origin = previouslyFocused.current;
      if (origin && origin.isConnected) {
        origin.focus();
      }
      previouslyFocused.current = null;
    };
  }, [isActive]);

  return containerRef;
}

interface DialogA11yWrapperProps {
  isActive: boolean;
  /** Nama dialog untuk pembaca layar (aria-label). */
  label: string;
  /** Dipanggil saat pengguna menekan Escape (opsional — onboarding bisa tanpa Esc). */
  onClose?: () => void;
  children: ReactNode;
}

/** Wrapper `role="dialog"` + seluruh perilaku aksesibilitas di atas. */
export function DialogA11yWrapper({ isActive, label, onClose, children }: DialogA11yWrapperProps) {
  const containerRef = useDialogA11y(isActive, onClose);
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal={isActive ? true : undefined}
      aria-label={label}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {children}
    </div>
  );
}
