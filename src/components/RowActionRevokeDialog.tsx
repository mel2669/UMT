import { useEffect, useId, useMemo, useState } from "react";
import overlayStyles from "./BulkActionDialog.module.css";
import {
  type BulkActionUserRow,
  getAllRolesForSelectedUsers,
} from "./BulkActionDialog";
import type { RowActionExtendScope } from "./RowActionExtendDialog";
import extendStyles from "./RowActionExtendDialog.module.css";
import { RolesAccordionList, type RolesAccordionRole } from "./RolesAccordionList";
import styles from "./RowActionRevokeDialog.module.css";

export type RowActionRevokeRow = {
  id?: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: "expired" | "active" | "revoked";
};

export type RowActionRevokeConfirmPayload = {
  scope: RowActionExtendScope;
};

export type RowActionRevokeDialogProps = {
  open: boolean;
  row: RowActionRevokeRow | null;
  allRows?: BulkActionUserRow[];
  onClose: () => void;
  onConfirm?: (payload: RowActionRevokeConfirmPayload) => void;
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

function RevokeWarningNote() {
  return (
    <div className={overlayStyles.revokeNote} role="status">
      <span className={overlayStyles.revokeNoteIcon} aria-hidden>
        !
      </span>
      <p className={overlayStyles.revokeNoteText}>
        This action cannot be undone. Users may lose access immediately based
        on your organization&apos;s policies.
      </p>
    </div>
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
    <label className={extendStyles.radioRow}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={extendStyles.srOnly}
      />
      <span className={extendStyles.radioVisual} aria-hidden>
        <span
          className={`${extendStyles.radioControl} ${
            checked ? extendStyles.radioControlSelected : ""
          }`}
        >
          <span className={extendStyles.radioDot} />
        </span>
      </span>
      <span className={extendStyles.rowLabel}>{label}</span>
    </label>
  );
}

export function RowActionRevokeDialog({
  open,
  row,
  allRows = [],
  onClose,
  onConfirm,
}: RowActionRevokeDialogProps) {
  const titleId = useId();
  const scopeGroupName = useId();
  const [scope, setScope] = useState<RowActionExtendScope>("single");

  const userAssignments = useMemo(() => {
    if (!row) return [];
    return getAllRolesForSelectedUsers([row as BulkActionUserRow], allRows);
  }, [row, allRows]);

  const showMultiRoleOption = userAssignments.length > 1;

  const revokableRows = useMemo(
    () => userAssignments.filter((r) => r.status !== "revoked"),
    [userAssignments],
  );

  const revokableCount = revokableRows.length;
  const skippedRevokeCount = userAssignments.length - revokableCount;

  const accordionPanels = useMemo(() => {
    const toRole = (r: BulkActionUserRow): RolesAccordionRole => ({
      label: r.role,
      status: r.status,
    });
    const revokableRoles = revokableRows.map(toRole);
    const skippedRoles = userAssignments
      .filter((r) => r.status === "revoked")
      .map(toRole);

    const panels: {
      id: string;
      title: string;
      roles: RolesAccordionRole[];
    }[] = [];

    if (revokableRoles.length > 0) {
      panels.push({
        id: "revoke-roles",
        title: "Roles to revoke",
        roles: revokableRoles,
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
  }, [revokableRows, userAssignments]);

  useEffect(() => {
    if (!open) return;
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

  const isAllUserRoles = scope === "all-user-roles";
  const userName = `${row.firstName} ${row.lastName}`;
  const intro =
    scope === "single" ? (
      <>
        Revoke <strong>{row.role}</strong> role for user <strong>{userName}</strong>.
      </>
    ) : revokableCount === 1 ? (
      <>
        Revoke <strong>1 role assignment</strong> for user <strong>{userName}</strong>.
      </>
    ) : (
      <>
        Revoke <strong>{revokableCount} role assignments</strong> for user{" "}
        <strong>{userName}</strong>.
      </>
    );

  const verbCta = isAllUserRoles ? "Revoke roles" : "Revoke role";
  const primaryDisabled = isAllUserRoles && revokableCount === 0;

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
          <RevokeWarningNote />

          {isAllUserRoles && skippedRevokeCount > 0 && (
            <p
              className={`${overlayStyles.extendEligibilityAlert} ${extendStyles.eligibilityAlertTop}`}
              role="status"
              aria-live="polite"
            >
              <span className={overlayStyles.extendEligibilityIcon} aria-hidden>
                i
              </span>
              Already revoked roles will not be included. From {userAssignments.length}{" "}
              assignments, {revokableCount} will be revoked.
            </p>
          )}

          <div className={styles.body}>
            <p className={styles.intro}>{intro}</p>

            {showMultiRoleOption && (
              <fieldset className={extendStyles.radioGroup}>
                <legend className={extendStyles.srOnly}>Roles to revoke</legend>
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

            {isAllUserRoles &&
              userAssignments.length > 0 &&
              accordionPanels.length > 0 && (
                <RolesAccordionList panels={accordionPanels} />
              )}
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            disabled={primaryDisabled}
            onClick={() => {
              onConfirm?.({ scope });
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
