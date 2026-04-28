import { useEffect, useMemo, useState } from "react";
import dialogStyles from "./ExtendRolesDialog.module.css";
import styles from "./BulkActionDialog.module.css";
import { APPLICATIONS } from "../data/globalFilterCatalog";

/** Concrete actions (used after confirm / scope-first menu). */
export type BulkActionConcreteId =
  | "extend-selected"
  | "extend-all-users"
  | "revoke-selected"
  | "revoke-all-users";

/** Includes impact-first entries where scope is chosen in the modal. */
export type BulkActionId =
  | BulkActionConcreteId
  | "extend-impact"
  | "revoke-impact";

export const MAX_BULK_ACTION_RECORDS = 100;

/** Minimal row shape for the modal (matches SamUserRow fields used here). */
export type BulkActionUserRow = {
  firstName: string;
  lastName: string;
  role: string;
  applicationId?: string;
  status: "expired" | "active" | "revoked";
  expirationDisplay: string;
};

function userKey(r: { firstName: string; lastName: string }) {
  return `${r.firstName}\u0000${r.lastName}`;
}

export function getAllRolesForSelectedUsers(
  selected: BulkActionUserRow[],
  allRows: BulkActionUserRow[],
): BulkActionUserRow[] {
  const keys = new Set(selected.map(userKey));
  return allRows.filter((r) => keys.has(userKey(r)));
}

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

function IconChevron({
  className,
  direction,
}: {
  className?: string;
  direction: "up" | "down";
}) {
  const path =
    direction === "up" ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4";
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type BulkActionDialogProps = {
  open: boolean;
  action: BulkActionId | null;
  onClose: () => void;
  /** Called when the user confirms (primary CTA). Always a concrete action. */
  onConfirm?: (action: BulkActionConcreteId) => void;
  selectedRows: BulkActionUserRow[];
  /** Full dataset — used to resolve “all roles for selected users”. */
  allRows: BulkActionUserRow[];
  /** Maximum allowed number of records in one edit operation. */
  recordLimit?: number;
  onRecordLimitExceeded?: (attemptedCount: number) => void;
  /** Shows Application column in affected-roles panel when true. */
  showApplicationColumn?: boolean;
};

export function BulkActionDialog({
  open,
  action,
  onClose,
  onConfirm,
  selectedRows,
  allRows,
  recordLimit = MAX_BULK_ACTION_RECORDS,
  onRecordLimitExceeded,
  showApplicationColumn = false,
}: BulkActionDialogProps) {
  const [notifyUser, setNotifyUser] = useState(false);
  const [scopeChoice, setScopeChoice] = useState<"selected" | "all-users">(
    "selected",
  );
  const [affectedRolesOpen, setAffectedRolesOpen] = useState(false);

  const isImpactFlow =
    action === "extend-impact" || action === "revoke-impact";

  const resolvedAction: BulkActionConcreteId | null = useMemo(() => {
    if (!action) return null;
    if (action === "extend-impact") {
      return scopeChoice === "selected"
        ? "extend-selected"
        : "extend-all-users";
    }
    if (action === "revoke-impact") {
      return scopeChoice === "selected"
        ? "revoke-selected"
        : "revoke-all-users";
    }
    return action;
  }, [action, scopeChoice]);

  const isExtend =
    resolvedAction === "extend-selected" ||
    resolvedAction === "extend-all-users";
  const isRevoke =
    resolvedAction === "revoke-selected" ||
    resolvedAction === "revoke-all-users";

  useEffect(() => {
    if (!open || !action) return;
    setNotifyUser(false);
    setAffectedRolesOpen(false);
    if (action === "extend-impact" || action === "revoke-impact") {
      setScopeChoice("selected");
    }
  }, [open, action]);

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
      if (e.key !== "Escape") return;
      if (affectedRolesOpen) {
        setAffectedRolesOpen(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, affectedRolesOpen]);

  const assignmentRows = selectedRows;
  const allRolesRows = useMemo(
    () => getAllRolesForSelectedUsers(selectedRows, allRows),
    [selectedRows, allRows],
  );

  const tableRows = useMemo(() => {
    if (!resolvedAction) return [];
    if (resolvedAction === "extend-selected") return assignmentRows;
    if (resolvedAction === "extend-all-users") return allRolesRows;
    if (resolvedAction === "revoke-selected") return selectedRows;
    return allRolesRows;
  }, [resolvedAction, assignmentRows, allRolesRows, selectedRows]);

  const userCount = useMemo(
    () => new Set(tableRows.map(userKey)).size,
    [tableRows],
  );
  const distinctRoleCount = useMemo(
    () => new Set(tableRows.map((r) => r.role)).size,
    [tableRows],
  );
  const affectedRoleRows = useMemo(() => {
    if (showApplicationColumn) {
      const unique = new Map<string, { applicationId: string; role: string }>();
      for (const r of tableRows) {
        const appId = r.applicationId ?? "";
        const key = `${appId}\u0000${r.role}`;
        if (!unique.has(key)) unique.set(key, { applicationId: appId, role: r.role });
      }
      return [...unique.values()].sort(
        (a, b) =>
          (APPLICATIONS.find((x) => x.id === a.applicationId)?.name ?? a.applicationId).localeCompare(
            APPLICATIONS.find((x) => x.id === b.applicationId)?.name ?? b.applicationId,
          ) || a.role.localeCompare(b.role),
      );
    }
    const uniqueRoles = [...new Set(tableRows.map((r) => r.role))].sort((a, b) =>
      a.localeCompare(b),
    );
    return uniqueRoles.map((role) => ({ applicationId: "", role }));
  }, [showApplicationColumn, tableRows]);
  const impactCount = tableRows.length;

  const title = isExtend ? "Extend roles" : "Revoke roles";

  const intro = useMemo(() => {
    if (!resolvedAction) return "";
    const n = selectedRows.length;
    const u = new Set(selectedRows.map(userKey)).size;
    const d = new Set(selectedRows.map((r) => r.role)).size;
    const m = allRolesRows.length;

    switch (resolvedAction) {
      case "extend-selected":
        return `Review all ${n} assignments that will be extended across ${u} users and ${d} distinct roles.`;
      case "extend-all-users":
        return `Review all ${m} role assignments for ${u} selected users.`;
      case "revoke-selected":
        return `You are about to revoke ${n} selected role assignments across ${u} users.`;
      case "revoke-all-users":
        return `You are about to revoke ${m} role assignments across ${u} users (every role for those users in this program).`;
      default:
        return "";
    }
  }, [resolvedAction, selectedRows, allRolesRows.length]);

  const primaryLabel = isExtend
    ? "Extend roles"
    : "Revoke roles";

  const handlePrimary = () => {
    if (impactCount > recordLimit) {
      onRecordLimitExceeded?.(impactCount);
      return;
    }
    if (resolvedAction) onConfirm?.(resolvedAction);
    onClose();
  };

  const handleAllUsersScopeSelection = () => {
    if (allRolesRows.length > recordLimit) {
      onRecordLimitExceeded?.(allRolesRows.length);
      return;
    }
    setScopeChoice("all-users");
  };

  if (!open || !action) return null;

  const summaryCards = (
    <div
      className={`${dialogStyles.summaryGrid} ${
        isImpactFlow ? styles.summaryGridImpact : ""
      }`}
    >
      <article
        className={`${dialogStyles.summaryCard} ${
          isImpactFlow ? styles.summaryCardImpact : ""
        }`}
      >
        <div className={dialogStyles.cardAccent} />
        <div className={dialogStyles.cardBody}>
          <p
            className={`${dialogStyles.cardKicker} ${
              isImpactFlow ? styles.cardKickerImpact : ""
            }`}
          >
            {isRevoke ? "Assignments" : "Impact"}
          </p>
          <p className={dialogStyles.cardNumber}>{impactCount}</p>
          <p className={dialogStyles.cardSub}>
            {isRevoke
              ? "Roles affected in this summary"
              : "Role assignments affected"}
          </p>
        </div>
      </article>
      <article
        className={`${dialogStyles.summaryCard} ${
          isImpactFlow ? styles.summaryCardImpact : ""
        }`}
      >
        <div className={dialogStyles.cardAccent} />
        <div className={dialogStyles.cardBody}>
          <p
            className={`${dialogStyles.cardKicker} ${
              isImpactFlow ? styles.cardKickerImpact : ""
            }`}
          >
            Users affected
          </p>
          <p className={dialogStyles.cardNumber}>{userCount}</p>
          <p className={dialogStyles.cardSub}>Users total</p>
        </div>
      </article>
      <article
        className={`${dialogStyles.summaryCard} ${
          isImpactFlow ? styles.summaryCardImpact : ""
        }`}
      >
        <div className={dialogStyles.cardAccent} />
        <div className={dialogStyles.cardBody}>
          <p
            className={`${dialogStyles.cardKicker} ${
              isImpactFlow ? styles.cardKickerImpact : ""
            }`}
          >
            Scope
          </p>
          <p className={dialogStyles.cardNumber}>{distinctRoleCount}</p>
          <p className={dialogStyles.cardSub}>Distinct roles</p>
        </div>
      </article>
    </div>
  );

  const extendDateBlock = isExtend && (
    <div className={dialogStyles.extendBlock}>
      <p className={dialogStyles.endDateNotice}>
        End date will be set to Aug 12, 2026
      </p>
    </div>
  );

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`${dialogStyles.dialog} ${styles.surface}`}
        data-name="Dialog 2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={dialogStyles.header}>
          <h1 className={dialogStyles.title} id="bulk-dialog-title">
            {title}
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

        {isImpactFlow ? (
          <>
            <div className={styles.bodyScroll}>
              {summaryCards}
              <div
                className={`${dialogStyles.extendBlock} ${styles.impactExtendSection}`}
              >
                <h2 className={dialogStyles.extendHeading}>
                  {action === "extend-impact" ? "Extend" : "Revoke"}
                </h2>
                <div
                  className={dialogStyles.segment}
                  role="group"
                  aria-label="Choose which roles to include"
                >
                  <button
                    type="button"
                    className={`${dialogStyles.segmentBtn} ${
                      scopeChoice === "selected"
                        ? dialogStyles.segmentBtnActive
                        : ""
                    } ${styles.segmentBtnImpact}`}
                    aria-pressed={scopeChoice === "selected"}
                    onClick={() => setScopeChoice("selected")}
                  >
                    Selected role assignments ({assignmentRows.length})
                  </button>
                  <button
                    type="button"
                    className={`${dialogStyles.segmentBtn} ${
                      scopeChoice === "all-users"
                        ? dialogStyles.segmentBtnActive
                        : ""
                    } ${styles.segmentBtnImpact}`}
                    aria-pressed={scopeChoice === "all-users"}
                    onClick={handleAllUsersScopeSelection}
                  >
                    All roles for selected users ({allRolesRows.length})
                  </button>
                </div>
                <p className={styles.impactScopeDetail}>{intro}</p>
              </div>
              {isRevoke && (
                <p className={styles.revokeNote}>
                  This action cannot be undone. Users may lose access immediately
                  based on your organization&apos;s policies.
                </p>
              )}
              <section className={styles.expansionPanel}>
                <button
                  type="button"
                  className={styles.expansionHeader}
                  aria-expanded={affectedRolesOpen}
                  onClick={() => setAffectedRolesOpen((v) => !v)}
                >
                  <IconChevron
                    className={styles.expansionChevron}
                    direction={affectedRolesOpen ? "up" : "down"}
                  />
                  <span>View affected roles</span>
                </button>
                {affectedRolesOpen && (
                  <div className={styles.expansionBody}>
                    <table className={styles.rolesTable}>
                      <thead>
                        <tr>
                          {showApplicationColumn && <th>Application</th>}
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {affectedRoleRows.map((row) => (
                          <tr key={`${row.applicationId}\u0000${row.role}`}>
                            {showApplicationColumn && (
                              <td>
                                {APPLICATIONS.find((a) => a.id === row.applicationId)?.name ??
                                  row.applicationId}
                              </td>
                            )}
                            <td>{row.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              {extendDateBlock}
              <label className={styles.notifyInline}>
                <input
                  type="checkbox"
                  checked={notifyUser}
                  onChange={(e) => setNotifyUser(e.target.checked)}
                />
                <span>Notify User</span>
              </label>
            </div>
            <footer className={`${dialogStyles.footer} ${styles.footerImpact}`}>
              <button
                type="button"
                className={dialogStyles.btnGhost}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={dialogStyles.btnPrimary}
                onClick={handlePrimary}
              >
                {primaryLabel}
              </button>
            </footer>
          </>
        ) : (
          <>
            <div className={styles.bodyScroll}>
              <p className={dialogStyles.intro}>{intro}</p>
              {isRevoke && (
                <p className={styles.revokeNote}>
                  This action cannot be undone. Users may lose access immediately
                  based on your organization&apos;s policies.
                </p>
              )}
              {summaryCards}
              <section className={styles.expansionPanel}>
                <button
                  type="button"
                  className={styles.expansionHeader}
                  aria-expanded={affectedRolesOpen}
                  onClick={() => setAffectedRolesOpen((v) => !v)}
                >
                  <IconChevron
                    className={styles.expansionChevron}
                    direction={affectedRolesOpen ? "up" : "down"}
                  />
                  <span>View affected roles</span>
                </button>
                {affectedRolesOpen && (
                  <div className={styles.expansionBody}>
                    <table className={styles.rolesTable}>
                      <thead>
                        <tr>
                          {showApplicationColumn && <th>Application</th>}
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {affectedRoleRows.map((row) => (
                          <tr key={`${row.applicationId}\u0000${row.role}`}>
                            {showApplicationColumn && (
                              <td>
                                {APPLICATIONS.find((a) => a.id === row.applicationId)?.name ??
                                  row.applicationId}
                              </td>
                            )}
                            <td>{row.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
              {extendDateBlock}
            </div>
            <footer className={dialogStyles.footer}>
              <label className={dialogStyles.notify}>
                <input
                  type="checkbox"
                  checked={notifyUser}
                  onChange={(e) => setNotifyUser(e.target.checked)}
                />
                <span>Notify User</span>
              </label>
              <button
                type="button"
                className={dialogStyles.btnGhost}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className={dialogStyles.btnPrimary}
                onClick={handlePrimary}
              >
                {primaryLabel}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
