import { useEffect } from "react";
import dialogStyles from "./ExtendRolesDialog.module.css";
import styles from "./BulkActionDialog.module.css";

type SelectionLimitDialogProps = {
  open: boolean;
  onClose: () => void;
  attemptedCount: number | null;
  limit: number;
};

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        fill="currentColor"
        d="M5.29 4.29a1 1 0 0 1 1.42 0L10 7.59l3.29-3.3a1 1 0 1 1 1.42 1.42L11.41 9l3.3 3.29a1 1 0 0 1-1.42 1.42L10 10.41l-3.29 3.3a1 1 0 0 1-1.42-1.42L8.59 9l-3.3-3.29a1 1 0 0 1 0-1.42Z"
      />
    </svg>
  );
}

export function SelectionLimitDialog({
  open,
  onClose,
  attemptedCount,
  limit,
}: SelectionLimitDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const attemptedCountLabel =
    attemptedCount === null ? "" : ` (${attemptedCount} requested)`;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={`${dialogStyles.dialog} ${styles.surface}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="selection-limit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={dialogStyles.header}>
          <h1 className={dialogStyles.title} id="selection-limit-title">
            Selection limit exceeded
          </h1>
          <button
            type="button"
            className={dialogStyles.iconBtn}
            aria-label="Close dialog"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </header>
        <div className={styles.bodyScroll}>
          <p className={dialogStyles.intro}>
            The system does not allow selecting or editing more than {limit} role
            assignments in one bulk action{attemptedCountLabel}. Reduce your
            selection and try again.
          </p>
        </div>
        <footer className={dialogStyles.footer}>
          <button
            type="button"
            className={dialogStyles.btnPrimary}
            onClick={onClose}
          >
            OK
          </button>
        </footer>
      </div>
    </div>
  );
}
