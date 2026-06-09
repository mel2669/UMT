import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./GrantRolesDialog.module.css";
import {
  type ReportDeptMajorSection,
  type ReportDeptRoleLeaf,
  type ReportDeptSubgroup,
  collectRoleIdsFromSubgroup,
  REPORT_DEPARTMENTAL_ROLE_CATALOG,
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

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 6 5 5 5-5"
      />
    </svg>
  );
}

function buildRoleTooltipContent(roleLabel: string) {
  return {
    summary: `${roleLabel} provides the holder with scoped access to complete day-to-day workflow tasks and reporting actions.`,
    capabilities: [
      `View ${roleLabel} dashboards and workflow queues`,
      "Open and review records tied to assigned programs",
      "Create and update role-appropriate report details",
      "Track status, deadlines, and completion milestones",
      "Export role-visible data for operational follow-up",
      "Coordinate with related teams through shared workflow context",
    ],
  };
}

function RoleInfoDetails({ roleLabel }: { roleLabel: string }) {
  const { summary, capabilities } = useMemo(
    () => buildRoleTooltipContent(roleLabel),
    [roleLabel],
  );
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <div className={styles.roleInfoBlock}>
      <p className={styles.roleSummary}>{summary}</p>
      <button
        type="button"
        className={styles.viewMoreButton}
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "View less" : "View more"}
        <span
          className={`${styles.viewMoreChevron} ${
            open ? styles.viewMoreChevronOpen : ""
          }`}
          aria-hidden
        >
          <IconChevron />
        </span>
      </button>
      {open && (
        <ul id={detailsId} className={styles.roleCapabilityList}>
          {capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      )}
    </div>
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
  const inputId = `dept-role-${leaf.id}`;
  const checked = isActive || picked.has(leaf.id);

  return (
    <div className={`${styles.roleRow} ${styles.roleRowSpaced} ${styles.leafIndent}`}>
      <input
        id={inputId}
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        disabled={isActive}
        readOnly={isActive}
        onChange={isActive ? undefined : () => onToggle(leaf.id)}
        aria-label={leaf.label}
      />
      <label
        className={`${styles.checkboxControl} ${
          isActive ? styles.checkboxControlChecked : ""
        }`}
        htmlFor={inputId}
        aria-hidden
      />
      <div className={styles.roleLabelGroup}>
        {isActive ? (
          <div className={styles.roleLabel}>{leaf.label}</div>
        ) : (
          <label className={styles.roleLabel} htmlFor={inputId}>
            {leaf.label}
          </label>
        )}
        <RoleInfoDetails roleLabel={leaf.label} />
      </div>
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

const GME_TRACK_APPLICATION_ID = "gme";
export const MIN_GRANTABLE_ROLES_FOR_ACCORDION = 3;

export const FEW_ROLES_DEMO_SECTIONS: ReportDeptMajorSection[] = [
  {
    id: "demo-few-roles",
    title: "Available roles",
    roles: [
      { id: "few-role-1", label: "GME Program Director" },
      { id: "few-role-2", label: "GME Coordinator" },
    ],
  },
];

function countGrantableRoles(
  roleLabelById: Map<string, string>,
  assignments: GrantRolesRow[],
): number {
  let count = 0;
  for (const label of roleLabelById.values()) {
    if (assignmentForCatalogLabel(assignments, label)?.status !== "active") {
      count += 1;
    }
  }
  return count;
}

export type GrantRolesDialogProps = {
  open: boolean;
  anchorRow: GrantRolesRow | null;
  allRows: GrantRolesRow[];
  /** Global application filter — GME Track uses accordion when enough roles are grantable. */
  selectedApplicationIds?: string[];
  /** Replaces the default catalog (e.g. few-roles demo). */
  sectionsOverride?: ReportDeptMajorSection[];
  onClose: () => void;
  onConfirm?: (roleNames: string[]) => void;
};

export function GrantRolesDialog({
  open,
  anchorRow,
  allRows,
  selectedApplicationIds = [],
  sectionsOverride,
  onClose,
  onConfirm,
}: GrantRolesDialogProps) {
  const titleId = useId();
  const selectAllIdPrefix = useId().replace(/:/g, "");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());

  const isGmeTrack = useMemo(
    () =>
      selectedApplicationIds.length === 1 &&
      selectedApplicationIds[0] === GME_TRACK_APPLICATION_ID,
    [selectedApplicationIds],
  );

  const assignments = useMemo(() => {
    if (!anchorRow) return [];
    const key = userKey(anchorRow);
    return allRows.filter((r) => userKey(r) === key);
  }, [anchorRow, allRows]);

  const genericRolesSection = useMemo<ReportDeptMajorSection>(() => {
    const roleLabels = [...new Set(allRows.map((r) => r.role).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );
    return {
      id: "generic-roles",
      title: "Generic roles",
      roles: roleLabels.map((label, index) => ({
        id: `generic-role-${index + 1}`,
        label,
      })),
    };
  }, [allRows]);

  const filteredSections = useMemo(
    () =>
      sectionsOverride ?? [genericRolesSection, ...REPORT_DEPARTMENTAL_ROLE_CATALOG],
    [sectionsOverride, genericRolesSection],
  );

  const roleLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of filteredSections) {
      if (section.roles) {
        for (const role of section.roles) map.set(role.id, role.label);
      }
      if (section.subgroups) {
        for (const subgroup of section.subgroups) {
          for (const role of subgroup.roles) map.set(role.id, role.label);
        }
      }
    }
    return map;
  }, [filteredSections]);

  const grantableRoleCount = useMemo(
    () => countGrantableRoles(roleLabelById, assignments),
    [roleLabelById, assignments],
  );

  const useAccordionView =
    isGmeTrack && grantableRoleCount >= MIN_GRANTABLE_ROLES_FOR_ACCORDION;

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
      const label = roleLabelById.get(id);
      if (!label) continue;
      const st = assignmentForCatalogLabel(assignments, label)?.status;
      if (st === "active") continue;
      n += 1;
    }
    return n;
  }, [picked, assignments, roleLabelById]);

  const currentCount = assignments.length;
  const totalAccess = currentCount + addingCount;
  const canSubmit = addingCount > 0;

  const togglePick = (id: string) => {
    const label = roleLabelById.get(id);
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
        const label = roleLabelById.get(id);
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
      .map((id) => roleLabelById.get(id))
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

  const renderAccordionSection = (section: ReportDeptMajorSection) => {
    if (section.roles) {
      const basicIds = section.roles.map((r) => r.id);
      const selectedInSection = basicIds.filter((id) => picked.has(id)).length;
      return (
        <details key={section.id} className={styles.accordionItem}>
          <summary className={styles.accordionSummary}>
            <span className={styles.accordionIndicator} aria-hidden>
              <IconChevron />
            </span>
            <h2 className={styles.accordionTitle}>
              {section.title}
              <span className={styles.subgroupCount}>
                {" "}
                ({selectedInSection}/{basicIds.length} selected)
              </span>
            </h2>
          </summary>
          <div className={styles.accordionContent}>
            <SelectAllRow
              inputId={`${selectAllIdPrefix}-sa-basic-accordion`}
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
        </details>
      );
    }

    if (section.subgroups) {
      return (
        <div key={section.id} className={styles.majorSection}>
          {section.subgroups.map((sg) => {
            const ids = collectRoleIdsFromSubgroup(sg);
            const selectedInSg = ids.filter((id) => picked.has(id)).length;
            return (
              <details key={sg.id} className={styles.accordionItem}>
                <summary className={styles.accordionSummary}>
                  <span className={styles.accordionIndicator} aria-hidden>
                    <IconChevron />
                  </span>
                  <h3 className={styles.accordionTitle}>
                    {sg.title}
                    <span className={styles.subgroupCount}>
                      {" "}
                      ({selectedInSg}/{ids.length} selected)
                    </span>
                  </h3>
                </summary>
                <div className={styles.accordionContent}>
                  <SelectAllRow
                    inputId={`${selectAllIdPrefix}-sa-${sg.id}-accordion`}
                    ids={ids}
                    picked={picked}
                    onToggleAll={(select) => toggleMany(ids, select)}
                  />
                  <div className={styles.leafList}>
                    {sg.roles.map((leaf) => (
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
              </details>
            );
          })}
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
          {useAccordionView ? (
            <div className={styles.accordionPanelShell}>
              {filteredSections.map((section) => renderAccordionSection(section))}
            </div>
          ) : (
            filteredSections.map((section) => renderMajorSection(section))
          )}
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
