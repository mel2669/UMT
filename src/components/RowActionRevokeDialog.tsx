import { useEffect, useId } from "react";
import overlayStyles from "./BulkActionDialog.module.css";
import styles from "./RowActionRevokeDialog.module.css";

export type RowActionRevokeRow = {
  id?: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type RowActionRevokeDialogProps = {
  open: boolean;
  row: RowActionRevokeRow | null;
  onClose: () => void;
  onConfirm?: () => void;
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

export function RowActionRevokeDialog({
  open,
  row,
  onClose,
  onConfirm,
}: RowActionRevokeDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !row) return null;

  const userDisplay = `${row.firstName} ${row.lastName}`;

  return (
    <div className={overlayStyles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={`${styles.dialog} ${overlayStyles.surface}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-node-id="3338:15459"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h1 className={styles.title} id={titleId}>
            Revoke Role
          </h1>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Close dialog"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </header>

        <div className={overlayStyles.bodyScroll}>
          <div className={styles.body}>
            <p className={styles.intro}>
              Revoke <strong>{row.role}</strong> role for user{" "}
              <strong>{userDisplay}</strong>.
            </p>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
          >
            Revoke role
          </button>
        </footer>
      </div>
    </div>
  );
}
