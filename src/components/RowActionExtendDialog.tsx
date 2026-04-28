import { useEffect, useId, useState } from "react";
import overlayStyles from "./BulkActionDialog.module.css";
import styles from "./RowActionExtendDialog.module.css";

export type RowActionExtendRow = {
  id?: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type RowActionExtendDialogProps = {
  open: boolean;
  row: RowActionExtendRow | null;
  maxDateDisplay: string;
  mode?: "extend" | "reinstate";
  onClose: () => void;
  onConfirm?: (payload: { endDateDisplay: string; notifyUser: boolean }) => void;
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

export function RowActionExtendDialog({
  open,
  row,
  maxDateDisplay,
  mode = "extend",
  onClose,
  onConfirm,
}: RowActionExtendDialogProps) {
  const titleId = useId();
  const [notifyUser, setNotifyUser] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNotifyUser(false);
  }, [open, row]);

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

  const selectedDateDisplay = maxDateDisplay;
  const isReinstate = mode === "reinstate";
  const verbTitle = isReinstate ? "Reinstate Role" : "Extend Role";
  const verbCta = isReinstate ? "Reinstate role" : "Extend role";
  const verbBody = isReinstate ? "Reinstate" : "Extend";

  return (
    <div className={overlayStyles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={`${styles.dialog} ${overlayStyles.surface}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h1 className={styles.title} id={titleId}>
            {verbTitle}
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
          <div className={styles.content}>
            <p className={styles.intro}>
              {verbBody} {row.role} role for user {row.firstName} {row.lastName}{" "}
              to {maxDateDisplay}
            </p>

            <label className={styles.notifyRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
              />
              <span className={styles.rowLabel}>Notify User</span>
            </label>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => {
              onConfirm?.({
                endDateDisplay: selectedDateDisplay,
                notifyUser,
              });
              onClose();
            }}
          >
            {verbCta}
          </button>
        </footer>
      </div>
    </div>
  );
}
