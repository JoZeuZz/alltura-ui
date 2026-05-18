import { ReactNode, useEffect, useId, useRef } from 'react';
import FocusTrap from 'focus-trap-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  /** External element id for aria-labelledby — skips rendering internal <h2> */
  titleId?: string;
  /** External element id for aria-describedby — skips rendering internal sr-only <p> */
  descriptionId?: string;
  /** When true, expands to full viewport height on mobile (< sm) with header pinned and content scrollable. Desktop behavior unchanged. Use on complex/long forms. */
  mobileFullscreen?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  titleId: externalTitleId,
  descriptionId: externalDescId,
  mobileFullscreen = false,
}: ModalProps) {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const dialogPanelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const internalTitleId = useId();
  const internalDescId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';

      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveTitleId = externalTitleId ?? (title ? internalTitleId : undefined);
  const effectiveDescId  = externalDescId  ?? (description ? internalDescId : undefined);
  const showInternalTitle = title && !externalTitleId;
  const headerJustify = showInternalTitle ? 'justify-between' : 'justify-end';

  const backdropCls = `fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-backdrop-in ${mobileFullscreen ? 'p-0 sm:p-4' : 'p-4'}`;

  const panelCls = mobileFullscreen
    ? 'bg-surface w-full animate-modal-in flex flex-col overflow-hidden rounded-none h-[100dvh] sm:rounded-2xl sm:h-auto sm:max-h-[85vh] sm:max-w-4xl sm:shadow-modal'
    : 'bg-surface p-4 sm:p-6 md:p-8 rounded-2xl shadow-modal w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-modal-in';

  const headerCls = mobileFullscreen
    ? `flex items-center flex-shrink-0 ${headerJustify} px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-2 md:px-8 md:pt-8`
    : `flex items-center mb-2 ${headerJustify}`;

  return (
    <FocusTrap
      focusTrapOptions={{
        initialFocus: () => {
          const panel = dialogPanelRef.current;
          if (!panel) return closeButtonRef.current ?? document.body;
          // Respect explicit autofocus attribute (e.g. cancel button in ConfirmationModal)
          const autoFocused = panel.querySelector<HTMLElement>('[autofocus]');
          if (autoFocused) return autoFocused;
          // First focusable form field for form-type modals
          const firstField = panel.querySelector<HTMLElement>(
            'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
          );
          return firstField ?? closeButtonRef.current ?? document.body;
        },
        fallbackFocus: () => dialogPanelRef.current ?? document.body,
        clickOutsideDeactivates: false,
        escapeDeactivates: false,
        returnFocusOnDeactivate: false,
      }}
    >
      <div
        className={backdropCls}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          ref={dialogPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={effectiveTitleId}
          aria-describedby={effectiveDescId}
          className={panelCls}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <div className={headerCls}>
            {showInternalTitle && (
              <h2 id={internalTitleId} className="heading-4 text-content-primary">
                {title}
              </h2>
            )}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-content-disabled hover:text-content-secondary hover:bg-surface-overlay transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex-shrink-0"
              aria-label="Cerrar"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {description && !externalDescId && (
            <p id={internalDescId} className="sr-only">{description}</p>
          )}
          {mobileFullscreen ? (
            <div className="flex-1 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 md:px-8 md:pb-8">
              {children}
            </div>
          ) : children}
        </div>
      </div>
    </FocusTrap>
  );
}
