import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./GrantRolesDialog.module.css";
import {
  type ReportDeptMajorSection,
  type ReportDeptRoleLeaf,
  type ReportDeptSubgroup,
  collectRoleIdsFromSubgroup,
  REPORT_DEPARTMENTAL_ROLE_CATALOG,
  getRoleLabelById,
} from "../data/reportDepartmentalRolesCatalog";

export type GrantRolesRow = {
  /** When present (e.g. table row id), used as a stable React key. */
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "expired" | "active" | "revoked";
  expirationDisplay: string;
  program: string;
};

function userKey(r: { firstName: string; lastName: string }) {
  return `${r.firstName}\u0000${r.lastName}`;
}

function assignmentForCatalogLabel(
  assignments: GrantRolesRow[],
  label: string,
): GrantRolesRow | null {
  const matches = assignments.filter((a) => a.role === label);
  if (!matches.length) return null;
  const order: Record<GrantRolesRow["status"], number> = {
    active: 0,
    expired: 1,
    revoked: 2,
  };
  return [...matches].sort((a, b) => order[a.status] - order[b.status])[0];
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

function IconCheckSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path
        fill="currentColor"
        d="M10.2 3 4.5 8.7 1.8 6l-.8.8 3.5 3.5L11 3.8l-.8-.8Z"
      />
    </svg>
  );
}

function IconIssue() {
  return (
    <svg className={styles.badgeIcon} viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 10.5h-1.5v-1.5h1.5v1.5Zm0-3h-1.5V4.5h1.5V8.5Z"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className={styles.badgeIcon} viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm3.2 5.23-4 4.5a1 1 0 0 1-1.45.05L4.8 9.8a1 1 0 1 1 1.4-1.42l.8.8 3.2-3.6a1 1 0 0 1 1.48 1.35Z"
      />
    </svg>
  );
}

function IconDash() {
  return (
    <svg className={styles.badgeIcon} viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-3 6.25h6v1.5H5v-1.5Z"
      />
    </svg>
  );
}

function SelectAllRow({
  ids,
  picked,
  onToggleAll,
  inputId,
}: {
  ids: string[];
  picked: Set<string>;
  onToggleAll: (select: boolean) => void;
  inputId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedCount = useMemo(
    () => ids.filter((id) => picked.has(id)).length,
    [ids, picked],
  );
  const all = ids.length > 0 && selectedCount === ids.length;
  const some = selectedCount > 0 && !all;

  useEffect(() => {
    const el = inputRef.current;
    if (el) el.indeterminate = some;
  }, [some, all]);

  return (
    <label className={styles.selectAllRow} htmlFor={inputId}>
      <input
        id={inputId}
        ref={inputRef}
        type="checkbox"
        className={styles.checkbox}
        checked={all}
        onChange={(e) => onToggleAll(e.target.checked)}
        aria-label="Select all in this list"
      />
      <span
        className={`${styles.checkboxControl} ${some ? styles.checkboxIndeterminate : ""}`}
        aria-hidden
      />
      <span className={styles.selectAllLabel}>Select All</span>
    </label>
  );
}

function RoleLeafRow({
  leaf,
  picked,
  assignments,
  onToggle,
}: {
  leaf: ReportDeptRoleLeaf;
  picked: Set<string>;
  assignments: GrantRolesRow[];
  onToggle: (id: string) => void;
}) {
  const a = assignmentForCatalogLabel(assignments, leaf.label);
  const isActive = a?.status === "active";
  const isExpired = a?.status === "expired";
  const inputId = `dept-role-${leaf.id}`;
  const checked = picked.has(leaf.id);

  if (isActive) {
    return (
      <div
        className={`${styles.roleRow} ${styles.roleRowSpaced} ${styles.rowAssigned}`}
      >
        <span className={styles.assignedCheck} aria-hidden>
          <IconCheckSmall />
        </span>
        <div className={`${styles.roleLabel} ${styles.roleLabelMuted}`}>
          {leaf.label}
        </div>
        <span className={`${styles.badge} ${styles.badgeOk}`}>
          <IconCheck />
          Assigned
        </span>
      </div>
    );
  }

  return (
    <div className={`${styles.roleRow} ${styles.roleRowSpaced} ${styles.leafIndent}`}>
      <input
        id={inputId}
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={() => onToggle(leaf.id)}
        aria-label={leaf.label}
      />
      <label className={styles.checkboxControl} htmlFor={inputId} aria-hidden />
      <label className={styles.roleLabel} htmlFor={inputId}>
        {leaf.label}
      </label>
      {isExpired && (
        <span className={`${styles.badge} ${styles.badgeAlert}`}>
          <IconIssue />
          Expired
        </span>
      )}
    </div>
  );
}

function SubgroupBlock({
  sg,
  selectAllInputId,
  picked,
  assignments,
  onToggle,
  onToggleMany,
}: {
  sg: ReportDeptSubgroup;
  selectAllInputId: string;
  picked: Set<string>;
  assignments: GrantRolesRow[];
  onToggle: (id: string) => void;
  onToggleMany: (ids: string[], select: boolean) => void;
}) {
  const ids = useMemo(() => collectRoleIdsFromSubgroup(sg), [sg]);
  const selectedInSg = useMemo(
    () => ids.filter((id) => picked.has(id)).length,
    [ids, picked],
  );

  return (
    <div className={styles.subgroup}>
      <h3 className={styles.subgroupTitle}>
        {sg.title}
        <span className={styles.subgroupCount}>
          {" "}
          ({selectedInSg}/{ids.length} selected)
        </span>
      </h3>
      <SelectAllRow
        inputId={selectAllInputId}
        ids={ids}
        picked={picked}
        onToggleAll={(select) => onToggleMany(ids, select)}
      />
      <div className={styles.leafList}>
        {sg.roles.map((leaf) => (
          <RoleLeafRow
            key={leaf.id}
            leaf={leaf}
            picked={picked}
            assignments={assignments}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

export type GrantRolesDialogProps = {
  open: boolean;
  anchorRow: GrantRolesRow | null;
  allRows: GrantRolesRow[];
  onClose: () => void;
  onConfirm?: (roleNames: string[]) => void;
};

export function GrantRolesDialog({
  open,
  anchorRow,
  allRows,
  onClose,
  onConfirm,
}: GrantRolesDialogProps) {
  const titleId = useId();
  const selectAllIdPrefix = useId().replace(/:/g, "");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());

  const assignments = useMemo(() => {
    if (!anchorRow) return [];
    const key = userKey(anchorRow);
    return allRows.filter((r) => userKey(r) === key);
  }, [anchorRow, allRows]);

  const filteredSections = useMemo(() => REPORT_DEPARTMENTAL_ROLE_CATALOG, []);

  useEffect(() => {
    if (!open) return;
    setPicked(new Set());
  }, [open, anchorRow]);

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

  const addingCount = useMemo(() => {
    let n = 0;
    for (const id of picked) {
      const label = getRoleLabelById(id);
      if (!label) continue;
      const st = assignmentForCatalogLabel(assignments, label)?.status;
      if (st === "active") continue;
      n += 1;
    }
    return n;
  }, [picked, assignments]);

  const currentCount = assignments.length;
  const totalAccess = currentCount + addingCount;
  const canSubmit = addingCount > 0;

  const togglePick = (id: string) => {
    const label = getRoleLabelById(id);
    if (!label) return;
    if (assignmentForCatalogLabel(assignments, label)?.status === "active") {
      return;
    }
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMany = (ids: string[], select: boolean) => {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        const label = getRoleLabelById(id);
        if (!label) continue;
        if (assignmentForCatalogLabel(assignments, label)?.status === "active")
          continue;
        if (select) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const handleGrant = () => {
    if (!canSubmit) return;
    const names = [...picked]
      .map((id) => getRoleLabelById(id))
      .filter(Boolean) as string[];
    onConfirm?.(names);
    onClose();
  };

  if (!open || !anchorRow) return null;

  const displayName = `${anchorRow.firstName} ${anchorRow.lastName}`;

  const renderMajorSection = (section: ReportDeptMajorSection) => {
    if (section.roles) {
      const basicIds = section.roles.map((r) => r.id);
      const selectedInSection = basicIds.filter((id) => picked.has(id)).length;
      return (
        <div key={section.id} className={styles.majorSection}>
          <h2 className={styles.majorSectionTitle}>
            {section.title}
            <span className={styles.subgroupCount}>
              {" "}
              ({selectedInSection}/{basicIds.length} selected)
            </span>
          </h2>
          <SelectAllRow
            inputId={`${selectAllIdPrefix}-sa-basic`}
            ids={basicIds}
            picked={picked}
            onToggleAll={(select) => toggleMany(basicIds, select)}
          />
          <div className={styles.leafList}>
            {section.roles.map((leaf) => (
              <RoleLeafRow
                key={leaf.id}
                leaf={leaf}
                picked={picked}
                assignments={assignments}
                onToggle={togglePick}
              />
            ))}
          </div>
        </div>
      );
    }

    if (section.subgroups) {
      return (
        <div key={section.id} className={styles.majorSection}>
          <h2 className={styles.majorSectionTitle}>{section.title}</h2>
          {section.subgroups.map((sg) => (
            <SubgroupBlock
              key={sg.id}
              sg={sg}
              selectAllInputId={`${selectAllIdPrefix}-sa-${sg.id}`}
              picked={picked}
              assignments={assignments}
              onToggle={togglePick}
              onToggleMany={toggleMany}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.shell}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.mainScroll}>
          <header className={styles.header}>
            <h1 className={styles.title} id={titleId}>
              Grant Roles to {displayName}
            </h1>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Close dialog"
              onClick={onClose}
            >
              <IconClose />
            </button>
          </header>

          {filteredSections.map((section) => renderMajorSection(section))}
        </div>

        <footer className={styles.footer}>
          <div className={styles.summary}>
            <div className={styles.summaryBlock}>
              <p className={styles.summaryKicker}>Current</p>
              <p className={styles.summaryValue}>{currentCount}</p>
            </div>
            <div className={styles.summaryBlock}>
              <p className={`${styles.summaryKicker} ${styles.summaryKickerAccent}`}>
                Adding
              </p>
              <p className={`${styles.summaryValue} ${styles.summaryValueAccent}`}>
                +{addingCount}
              </p>
            </div>
            <div className={styles.summaryBlock}>
              <p className={styles.summaryKicker}>Total access</p>
              <p className={`${styles.summaryValue} ${styles.summaryValueTotal}`}>
                {totalAccess}
              </p>
            </div>
          </div>
          <div className={styles.footerActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={`${styles.btnPrimary} ${canSubmit ? styles.btnPrimaryEnabled : ""}`}
              disabled={!canSubmit}
              onClick={handleGrant}
            >
              Grant Roles
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
