import { useEffect, useId, useMemo, useState } from "react";
import overlayStyles from "./BulkActionDialog.module.css";
import {
  type BulkActionUserRow,
  getAllRolesForSelectedUsers,
} from "./BulkActionDialog";
import { RolesAccordionList, type RolesAccordionRole } from "./RolesAccordionList";
import styles from "./RowActionExtendDialog.module.css";

export type RowActionExtendRow = {
  id?: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: "expired" | "active" | "revoked";
  expirationDisplay?: string;
};

export type RowActionExtendScope = "single" | "all-user-roles";

export type RowActionExtendConfirmPayload = {
  endDateDisplay: string;
  notifyUser: boolean;
  scope: RowActionExtendScope;
};

export type RowActionExtendDialogProps = {
  open: boolean;
  row: RowActionExtendRow | null;
  allRows?: BulkActionUserRow[];
  maxDateDisplay: string;
  mode?: "extend" | "reinstate";
  onClose: () => void;
  onConfirm?: (payload: RowActionExtendConfirmPayload) => void;
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

function ScopeRadio({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: RowActionExtendScope;
  checked: boolean;
  onChange: (value: RowActionExtendScope) => void;
  label: string;
}) {
  return (
    <label className={styles.radioRow}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={styles.srOnly}
      />
      <span className={styles.radioVisual} aria-hidden>
        <span
          className={`${styles.radioControl} ${
            checked ? styles.radioControlSelected : ""
          }`}
        >
          <span className={styles.radioDot} />
        </span>
      </span>
      <span className={styles.rowLabel}>{label}</span>
    </label>
  );
}

export function RowActionExtendDialog({
  open,
  row,
  allRows = [],
  maxDateDisplay,
  mode = "extend",
  onClose,
  onConfirm,
}: RowActionExtendDialogProps) {
  const titleId = useId();
  const scopeGroupName = useId();
  const [notifyUser, setNotifyUser] = useState(false);
  const [scope, setScope] = useState<RowActionExtendScope>("single");

  const isReinstate = mode === "reinstate";
  const showScopeChoice = !isReinstate && row !== null;

  const userAssignments = useMemo(() => {
    if (!row || !showScopeChoice) return [];
    return getAllRolesForSelectedUsers(
      [row as BulkActionUserRow],
      allRows,
    );
  }, [row, allRows, showScopeChoice]);

  const showMultiRoleOption = userAssignments.length > 1;

  const extendableRows = useMemo(
    () => userAssignments.filter((r) => r.status === "active"),
    [userAssignments],
  );

  const extendableCount = extendableRows.length;
  const skippedExtendCount = userAssignments.length - extendableCount;

  const accordionPanels = useMemo(() => {
    if (!showScopeChoice) return [];
    const toRole = (r: BulkActionUserRow): RolesAccordionRole => ({
      label: r.role,
      status: r.status,
    });
    const extendableRoles = extendableRows.map(toRole);
    const skippedRoles = userAssignments
      .filter((r) => r.status !== "active")
      .map(toRole);

    const panels: {
      id: string;
      title: string;
      roles: RolesAccordionRole[];
    }[] = [];

    if (extendableRoles.length > 0) {
      panels.push({
        id: "extend-roles",
        title: "Roles to extend",
        roles: extendableRoles,
      });
    }
    if (skippedRoles.length > 0) {
      panels.push({
        id: "not-included",
        title: "Not included",
        roles: skippedRoles,
      });
    }
    return panels;
  }, [showScopeChoice, extendableRows, userAssignments]);

  useEffect(() => {
    if (!open) return;
    setNotifyUser(false);
    setScope("single");
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
  const verbTitle = isReinstate ? "Reinstate Role" : "Extend Role";
  const verbBody = isReinstate ? "Reinstate" : "Extend";
  const isAllUserRoles = scope === "all-user-roles";
  const verbCta = isReinstate
    ? "Reinstate role"
    : isAllUserRoles
      ? "Extend roles"
      : "Extend role";

  const userName = `${row.firstName} ${row.lastName}`;
  const intro =
    isReinstate || scope === "single"
      ? `${verbBody} ${row.role} role for user ${userName} to ${maxDateDisplay}`
      : extendableCount === 1
        ? `${verbBody} 1 role assignment for ${userName} to ${maxDateDisplay}`
        : `${verbBody} ${extendableCount} role assignments for ${userName} to ${maxDateDisplay}`;

  const primaryDisabled =
    !isReinstate && isAllUserRoles && extendableCount === 0;

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
          {showScopeChoice && isAllUserRoles && skippedExtendCount > 0 && (
            <p
              className={`${overlayStyles.extendEligibilityAlert} ${styles.eligibilityAlertTop}`}
              role="status"
              aria-live="polite"
            >
              <span className={overlayStyles.extendEligibilityIcon} aria-hidden>
                i
              </span>
              Only Active roles can be extended. From {userAssignments.length}{" "}
              assignments, {extendableCount} will be extended.
            </p>
          )}

          <div className={styles.content}>
            <p className={styles.intro}>{intro}</p>

            {showScopeChoice && showMultiRoleOption && (
              <fieldset className={styles.radioGroup}>
                <legend className={styles.srOnly}>Roles to extend</legend>
                <ScopeRadio
                  name={scopeGroupName}
                  value="single"
                  checked={scope === "single"}
                  onChange={setScope}
                  label="This role only"
                />
                <ScopeRadio
                  name={scopeGroupName}
                  value="all-user-roles"
                  checked={scope === "all-user-roles"}
                  onChange={setScope}
                  label={`All roles for ${userName} (${userAssignments.length})`}
                />
              </fieldset>
            )}

            {showScopeChoice &&
              isAllUserRoles &&
              userAssignments.length > 0 &&
              accordionPanels.length > 0 && (
                <RolesAccordionList panels={accordionPanels} />
              )}

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
            disabled={primaryDisabled}
            onClick={() => {
              onConfirm?.({
                endDateDisplay: selectedDateDisplay,
                notifyUser,
                scope: isReinstate ? "single" : scope,
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
