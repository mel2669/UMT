import { useEffect, useMemo, useState } from "react";
import dialogStyles from "./ExtendRolesDialog.module.css";
import styles from "./BulkActionDialog.module.css";
import { APPLICATIONS, INSTITUTIONS, programName } from "../data/globalFilterCatalog";

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
  program?: string;
  applicationId?: string;
  institutionId?: string;
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
  filterContext?: {
    appIds: string[];
    instIds: string[];
    progIds: string[];
  };
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
  filterContext,
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
  const extendableRows = useMemo(
    () => tableRows.filter((r) => r.status === "active"),
    [tableRows],
  );
  const rowsForImpact = isExtend ? extendableRows : tableRows;
  const selectedForActionCount = tableRows.length;
  const extendableCount = extendableRows.length;
  const skippedExtendCount = selectedForActionCount - extendableCount;

  const affectedRoles = useMemo(
    () => [...new Set(rowsForImpact.map((r) => r.role))].sort((a, b) => a.localeCompare(b)),
    [rowsForImpact],
  );
  const rowDerivedPrograms = useMemo(() => {
    const names = rowsForImpact
      .map((r) => r.program?.trim() ?? "")
      .filter((name) => name.length > 0 && name !== "-");
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [rowsForImpact]);
  const rowDerivedApplications = useMemo(() => {
    const names = rowsForImpact
      .map((r) => r.applicationId)
      .filter((id): id is string => Boolean(id))
      .map((id) => APPLICATIONS.find((a) => a.id === id)?.name ?? id);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [rowsForImpact]);
  const rowDerivedInstitutions = useMemo(() => {
    const names = rowsForImpact
      .map((r) => r.institutionId)
      .filter((id): id is string => Boolean(id))
      .map((id) => INSTITUTIONS.find((i) => i.id === id)?.name ?? id);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [rowsForImpact]);
  const filterApplications = useMemo(
    () =>
      (filterContext?.appIds ?? [])
        .map((id) => APPLICATIONS.find((a) => a.id === id)?.name ?? id)
        .sort((a, b) => a.localeCompare(b)),
    [filterContext?.appIds],
  );
  const filterInstitutions = useMemo(
    () =>
      (filterContext?.instIds ?? [])
        .map((id) => INSTITUTIONS.find((i) => i.id === id)?.name ?? id)
        .sort((a, b) => a.localeCompare(b)),
    [filterContext?.instIds],
  );
  const filterPrograms = useMemo(
    () =>
      (filterContext?.progIds ?? [])
        .map((id) => programName(id))
        .sort((a, b) => a.localeCompare(b)),
    [filterContext?.progIds],
  );
  const affectedApplications =
    filterApplications.length > 0 ? filterApplications : rowDerivedApplications;
  const affectedInstitutions =
    filterInstitutions.length > 0 ? filterInstitutions : rowDerivedInstitutions;
  const affectedPrograms =
    filterPrograms.length > 0 ? filterPrograms : rowDerivedPrograms;
  const impactCount = rowsForImpact.length;
  const usersAffectedCount = impactCount;
  const rolesAffectedCount = affectedRoles.length;
  const programsAffectedCount = affectedPrograms.length;
  const applicationsAffectedCount = affectedApplications.length;
  const institutionsAffectedCount = affectedInstitutions.length;

  const title = isExtend ? "Extend Roles" : "Revoke Roles";

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

  const summaryCardsData = [
    { label: "Users", count: usersAffectedCount },
    { label: "Roles", count: rolesAffectedCount },
    { label: "Programs", count: programsAffectedCount },
    { label: "Institutions", count: institutionsAffectedCount },
    { label: "Applications", count: applicationsAffectedCount },
  ].filter((card) => card.count > 1);

  const summaryCards = (
    <div
      className={`${dialogStyles.summaryGrid} ${
        isImpactFlow ? styles.summaryGridImpact : ""
      }`}
    >
      {summaryCardsData.map((card) => (
        <article
          key={card.label}
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
              {card.label}
            </p>
            <p className={dialogStyles.cardNumber}>{card.count}</p>
            <p className={dialogStyles.cardSub}>Users total</p>
          </div>
        </article>
      ))}
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
              <div className={`${dialogStyles.extendBlock} ${styles.impactExtendSection}`}>
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
              </div>
              {isRevoke && (
                <p className={styles.revokeNote}>
                  This action cannot be undone. Users may lose access immediately
                  based on your organization&apos;s policies.
                </p>
              )}
              {isExtend && skippedExtendCount > 0 && (
                <p className={styles.extendEligibilityAlert} role="status" aria-live="polite">
                  <span className={styles.extendEligibilityIcon} aria-hidden>
                    i
                  </span>
                  Only Active roles can be extended. From {selectedForActionCount} selected,{" "}
                  {extendableCount} will be extended
                </p>
              )}
              {extendDateBlock}
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
                  <span>Here&apos;s what&apos;s being modified</span>
                </button>
                <div
                  className={`${styles.expansionContent} ${
                    affectedRolesOpen ? styles.expansionContentOpen : ""
                  }`}
                  aria-hidden={!affectedRolesOpen}
                >
                  <div className={styles.expansionContentInner}>
                    <div className={styles.expansionBody}>
                      <div className={styles.scopeGroups}>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Roles</h3>
                          <div className={styles.scopeList}>
                            {(affectedRoles.length ? affectedRoles : ["None"]).map((item) => (
                              <p key={`role-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Programs</h3>
                          <div className={styles.scopeList}>
                            {(affectedPrograms.length ? affectedPrograms : ["None"]).map((item) => (
                              <p key={`program-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Institutions</h3>
                          <div className={styles.scopeList}>
                            {(affectedInstitutions.length ? affectedInstitutions : ["None"]).map((item) => (
                              <p key={`institution-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Applications</h3>
                          <div className={styles.scopeList}>
                            {(affectedApplications.length ? affectedApplications : ["None"]).map((item) => (
                              <p key={`application-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
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
                className={
                  isRevoke ? styles.btnRevokePrimary : dialogStyles.btnPrimary
                }
                onClick={handlePrimary}
              >
                {primaryLabel}
              </button>
            </footer>
          </>
        ) : (
          <>
            <div className={styles.bodyScroll}>
              {isRevoke && (
                <p className={styles.revokeNote}>
                  This action cannot be undone. Users may lose access immediately
                  based on your organization&apos;s policies.
                </p>
              )}
              {isExtend && skippedExtendCount > 0 && (
                <p className={styles.extendEligibilityAlert} role="status" aria-live="polite">
                  <span className={styles.extendEligibilityIcon} aria-hidden>
                    i
                  </span>
                  Only Active roles can be extended. From {selectedForActionCount} selected,{" "}
                  {extendableCount} will be extended
                </p>
              )}
              {extendDateBlock}
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
                  <span>Here&apos;s what&apos;s being modified</span>
                </button>
                <div
                  className={`${styles.expansionContent} ${
                    affectedRolesOpen ? styles.expansionContentOpen : ""
                  }`}
                  aria-hidden={!affectedRolesOpen}
                >
                  <div className={styles.expansionContentInner}>
                    <div className={styles.expansionBody}>
                      <div className={styles.scopeGroups}>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Roles</h3>
                          <div className={styles.scopeList}>
                            {(affectedRoles.length ? affectedRoles : ["None"]).map((item) => (
                              <p key={`role-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Programs</h3>
                          <div className={styles.scopeList}>
                            {(affectedPrograms.length ? affectedPrograms : ["None"]).map((item) => (
                              <p key={`program-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Institutions</h3>
                          <div className={styles.scopeList}>
                            {(affectedInstitutions.length ? affectedInstitutions : ["None"]).map((item) => (
                              <p key={`institution-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className={styles.scopeGroup}>
                          <h3 className={styles.scopeHeading}>Applications</h3>
                          <div className={styles.scopeList}>
                            {(affectedApplications.length ? affectedApplications : ["None"]).map((item) => (
                              <p key={`application-${item}`} className={styles.scopeValue}>
                                {item}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
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
                className={
                  isRevoke ? styles.btnRevokePrimary : dialogStyles.btnPrimary
                }
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
