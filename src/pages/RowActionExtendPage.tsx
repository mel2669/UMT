import { useEffect, useId, useMemo, useState } from "react";
import {
  BulkActionDialog,
  type BulkActionConcreteId,
  type BulkActionId,
} from "../components/BulkActionDialog";
import { ColumnMultiSelectFilter } from "../components/ColumnMultiSelectFilter";
import { Toast } from "../components/Toast";
import styles from "./RowActionExtendPage.module.css";

type TabId = "all" | "expiring" | "expiredRecent";

export type SamUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "expired" | "active" | "revoked";
  program: string;
  expirationDisplay: string;
  /** Demo tab filters — which views include this row */
  tabMatch: TabId[];
};

const PROGRAM = "0203521053 - University at Buffalo Program - Allergy and Immunology";

const ALL_ROWS: SamUserRow[] = [
  {
    id: "1",
    firstName: "Morgan",
    lastName: "Lee",
    email: "morgan.lee@jh.edu",
    role: "Program Coordinator",
    status: "expired",
    program: PROGRAM,
    expirationDisplay: "Aug 22, 2025",
    tabMatch: ["all", "expiredRecent"],
  },
  {
    id: "2",
    firstName: "Morgan",
    lastName: "Lee",
    email: "morgan.lee@jh.edu",
    role: "Program Super User",
    status: "active",
    program: PROGRAM,
    expirationDisplay: "Aug 15, 2026",
    tabMatch: ["all", "expiring"],
  },
  {
    id: "3",
    firstName: "Jordan",
    lastName: "Park",
    email: "jordan.park@jh.edu",
    role: "Reviewer/interviewer",
    status: "active",
    program: PROGRAM,
    expirationDisplay: "Aug 17, 2026",
    tabMatch: ["all", "expiring"],
  },
  {
    id: "4",
    firstName: "Jordan",
    lastName: "Park",
    email: "jordan.park@jh.edu",
    role: "Institution Super User",
    status: "expired",
    program: PROGRAM,
    expirationDisplay: "Aug 17, 2025",
    tabMatch: ["all", "expiredRecent"],
  },
  {
    id: "5",
    firstName: "Emily",
    lastName: "Hoganmoody",
    email: "emily.hoganmoody@jh.edu",
    role: "Institution Super User",
    status: "active",
    program: "-",
    expirationDisplay: "Aug 19, 2026",
    tabMatch: ["all", "expiring"],
  },
  {
    id: "6",
    firstName: "Daniel",
    lastName: "Connor",
    email: "daniel.connor@jh.edu",
    role: "Alternate Program Super User",
    status: "active",
    program: PROGRAM,
    expirationDisplay: "Sep 10, 2026",
    tabMatch: ["all", "expiring"],
  },
  {
    id: "7",
    firstName: "Elizabeth",
    lastName: "Wilson",
    email: "elizabeth.wilson@jh.edu",
    role: "Program Coordinator",
    status: "active",
    program: PROGRAM,
    expirationDisplay: "Oct 5, 2026",
    tabMatch: ["all", "expiring"],
  },
  {
    id: "8",
    firstName: "Daniel",
    lastName: "Chen",
    email: "daniel.chen@jh.edu",
    role: "Alternate Program Super User",
    status: "revoked",
    program: PROGRAM,
    expirationDisplay: "Nov 12, 2026",
    tabMatch: ["all"],
  },
  {
    id: "9",
    firstName: "Jessica",
    lastName: "Ross",
    email: "jessica.ross@jh.edu",
    role: "Alternate Institution Super User",
    status: "expired",
    program: "-",
    expirationDisplay: "Jul 1, 2025",
    tabMatch: ["all", "expiredRecent"],
  },
  {
    id: "10",
    firstName: "Elizabeth",
    lastName: "Zane",
    email: "elizabeth.zane@jh.edu",
    role: "Program Coordinator",
    status: "active",
    program: PROGRAM,
    expirationDisplay: "Mar 15, 2027",
    tabMatch: ["all"],
  },
];

const STATUS_SELECT_OPTIONS: { value: SamUserRow["status"]; label: string }[] =
  [
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "revoked", label: "Revoked" },
  ];

const BULK_ACTION_TOAST: Record<BulkActionConcreteId, string> = {
  "extend-selected": "Selected role assignments were extended.",
  "extend-all-users":
    "All role assignments for the selected users were extended.",
  "revoke-selected": "Selected role assignments were revoked.",
  "revoke-all-users":
    "All role assignments were revoked for the selected users.",
};

function IconSort() {
  return (
    <svg
      className={styles.sortIcon}
      width={15}
      height={15}
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.8 4.8V11.3336L6.8688 9.2656L8 10.3968L3.9968 14.4L0 10.4032L1.1312 9.272L3.2 11.3408V4.8H4.8ZM10.3968 0L14.4 4.0032L13.2688 5.1344L11.2 3.0664V9.6H9.6V3.0592L7.5312 5.128L6.4 3.9968L10.3968 0Z"
        fill="#666666"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg
      className={styles.searchIcon}
      width={13}
      height={13}
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.42222 4.97778C1.42222 3.01724 3.01724 1.42222 4.97778 1.42222C6.93831 1.42222 8.53333 3.01724 8.53333 4.97778C8.53333 6.93831 6.93831 8.53333 4.97778 8.53333C3.01724 8.53333 1.42222 6.93831 1.42222 4.97778ZM12.8 11.7945L8.95858 7.95307C9.58151 7.12178 9.95556 6.09422 9.95556 4.97778C9.95556 2.2336 7.72196 0 4.97778 0C2.23289 0 0 2.2336 0 4.97778C0 7.72196 2.23289 9.95556 4.97778 9.95556C6.09422 9.95556 7.12178 9.58151 7.95307 8.95858L11.7945 12.8L12.8 11.7945Z"
        fill="#666666"
      />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg className={styles.tabWarnIcon} viewBox="0 0 16 16" aria-hidden>
      <path d="M8 1 15 14H1L8 1Zm-1 9v2h2v-2H7Zm0-5v4h2V5H7Z" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <path
        fill="currentColor"
        d="M10 4a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
      />
    </svg>
  );
}

/** Matches table header dropdown chevrons (Form Field / Dropdown) */
function IconDropdownChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma Menu — node 3199:5558 */
const BULK_MENU_OPTIONS_SCOPE_FIRST = [
  { id: "extend-selected", label: "Extend selected roles", nodeId: "3199:5559" },
  { id: "extend-all-users", label: "Extend all roles for selected users", nodeId: "3199:5560" },
  { id: "revoke-selected", label: "Revoke selected roles", nodeId: "3199:5575" },
  { id: "revoke-all-users", label: "Revoke all roles for selected users", nodeId: "3199:5579" },
] as const;

const BULK_MENU_OPTIONS_IMPACT_FIRST = [
  { id: "extend-impact", label: "Extend roles", nodeId: "impact-extend" },
  { id: "revoke-impact", label: "Revoke roles", nodeId: "impact-revoke" },
] as const;

type BulkViewMode = "scope-first" | "impact-first";

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

function StatusBadge({ status }: { status: SamUserRow["status"] }) {
  if (status === "expired") {
    return (
      <span className={`${styles.badge} ${styles.badgeAlert}`}>
        <IconIssue />
        Expired
      </span>
    );
  }
  if (status === "revoked") {
    return (
      <span className={`${styles.badge} ${styles.badgeNeutral}`}>
        <IconDash />
        Revoked
      </span>
    );
  }
  return (
    <span className={`${styles.badge} ${styles.badgeOk}`}>
      <IconCheck />
      Active
    </span>
  );
}

export function RowActionExtendPage() {
  const [tab, setTab] = useState<TabId>("all");
  const [qFirst, setQFirst] = useState("");
  const [qLast, setQLast] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [qProgram, setQProgram] = useState("");
  const [filterExpirations, setFilterExpirations] = useState<string[]>([]);
  const [showProgramCol, setShowProgramCol] = useState(true);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<
    null | "role" | "status" | "expiration"
  >(null);
  const filterId = useId();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkModalAction, setBulkModalAction] = useState<BulkActionId | null>(
    null,
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bulkViewMode, setBulkViewMode] = useState<BulkViewMode>("scope-first");

  const bulkMenuOptions =
    bulkViewMode === "scope-first"
      ? BULK_MENU_OPTIONS_SCOPE_FIRST
      : BULK_MENU_OPTIONS_IMPACT_FIRST;

  const selectedRows = useMemo(
    () => ALL_ROWS.filter((r) => selected.has(r.id)),
    [selected],
  );

  useEffect(() => {
    if (!bulkMenuOpen) return;
    const close = () => setBulkMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [bulkMenuOpen]);

  useEffect(() => {
    if (!toastMessage) return;
    const id = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(id);
  }, [toastMessage]);

  const roleFilterOptions = useMemo(() => {
    const roles = [...new Set(ALL_ROWS.map((r) => r.role))].sort((a, b) =>
      a.localeCompare(b),
    );
    return roles.map((r) => ({ value: r, label: r }));
  }, []);

  const expirationFilterOptions = useMemo(() => {
    const dates = [...new Set(ALL_ROWS.map((r) => r.expirationDisplay))].sort(
      (a, b) => a.localeCompare(b, undefined, { numeric: true }),
    );
    return dates.map((d) => ({ value: d, label: d }));
  }, []);

  const filtered = useMemo(() => {
    return ALL_ROWS.filter((r) => {
      if (tab !== "all" && !r.tabMatch.includes(tab)) return false;
      const f = qFirst.trim().toLowerCase();
      const l = qLast.trim().toLowerCase();
      const e = qEmail.trim().toLowerCase();
      const prog = qProgram.trim().toLowerCase();
      if (f && !r.firstName.toLowerCase().includes(f)) return false;
      if (l && !r.lastName.toLowerCase().includes(l)) return false;
      if (e && !r.email.toLowerCase().includes(e)) return false;
      if (filterRoles.length && !filterRoles.includes(r.role)) return false;
      if (filterStatuses.length && !filterStatuses.includes(r.status))
        return false;
      if (
        filterExpirations.length &&
        !filterExpirations.includes(r.expirationDisplay)
      )
        return false;
      if (prog && !r.program.toLowerCase().includes(prog)) return false;
      return true;
    });
  }, [
    tab,
    qFirst,
    qLast,
    qEmail,
    qProgram,
    filterRoles,
    filterStatuses,
    filterExpirations,
  ]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    const ids = pageRows.map((r) => r.id);
    const allOn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleBulkMenuAction = (optionId: BulkActionId) => {
    setBulkMenuOpen(false);
    const n = selectedRows.length;
    if (n === 0) {
      window.alert("Select one or more rows first.");
      return;
    }

    setBulkModalAction(optionId);
  };

  return (
    <div className={styles.page} data-name="Row Action - Extend 1">
      <div className={styles.shell}>
        <header className={styles.utility} aria-label="Utility navigation">
          <div className={styles.utilityUser}>
            <div>Nicole Stein</div>
            <div>Description (Optional)</div>
          </div>
          <div className={styles.avatar} aria-hidden>
            NS
          </div>
        </header>

        <nav className={styles.primaryNav} aria-label="Primary navigation">
          <div className={styles.logoBlock}>
            <span className={styles.logoMark}>AAMC</span>
            <span>User management tool</span>
          </div>
          <div className={styles.navItems}>
            <button type="button" className={styles.navItem}>
              Invite User
            </button>
            <button type="button" className={`${styles.navItem} ${styles.navItemActive}`}>
              Users
            </button>
            <button type="button" className={styles.navItem}>
              Relationships
            </button>
            <button type="button" className={styles.navItem}>
              Roles
            </button>
            <button type="button" className={styles.navItem}>
              Access Codes
            </button>
            <button type="button" className={styles.navItem}>
              Code Banks
            </button>
            <button type="button" className={styles.navItem}>
              Groups
            </button>
            <button type="button" className={styles.navItem}>
              Help
            </button>
          </div>
        </nav>

        <div className={styles.secondaryNav}>
          <div className={styles.secondaryInner}>
            <label className={styles.viewModeField}>
              <span className={styles.viewModeLabel}>View</span>
              <select
                className={styles.viewModeSelect}
                value={bulkViewMode}
                onChange={(e) =>
                  setBulkViewMode(e.target.value as BulkViewMode)
                }
                aria-label="Bulk actions view: scope first or impact first"
              >
                <option value="scope-first">Scope First</option>
                <option value="impact-first">Impact First</option>
              </select>
            </label>
            <button type="button" className={`${styles.secondaryLink} ${styles.secondaryLinkActive}`}>
              Manage Users
            </button>
            <button type="button" className={styles.secondaryLink}>
              Search Users
            </button>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <span>ERAS Program Director Work Station</span>
          <span aria-hidden>›</span>
          <span>Johns Hopkins University School of Medicine</span>
        </div>
        <h1 className={styles.pageTitle}>{PROGRAM}</h1>

        <div className={styles.tabs} role="tablist" aria-label="Role filters">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "all"}
            className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
            onClick={() => {
              setTab("all");
              setPage(1);
            }}
          >
            All roles
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "expiring"}
            className={`${styles.tab} ${tab === "expiring" ? styles.tabActive : ""}`}
            onClick={() => {
              setTab("expiring");
              setPage(1);
            }}
          >
            Roles expiring in 30 days
            <IconWarning />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "expiredRecent"}
            className={`${styles.tab} ${tab === "expiredRecent" ? styles.tabActive : ""}`}
            onClick={() => {
              setTab("expiredRecent");
              setPage(1);
            }}
          >
            Roles expired in last 30 days
            <IconWarning />
          </button>
        </div>

        <section className={styles.card} aria-label="Users table">
          <div className={styles.toolbar}>
            <button type="button" className={styles.btnSecondary}>
              Reorder
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setShowProgramCol((prev) => {
                  if (prev) setQProgram("");
                  return !prev;
                });
                setPage(1);
              }}
            >
              Show/Hide
            </button>
            <div className={styles.toolbarGrow}>
              <div className={styles.bulkDropdownWrap}>
                <button
                  type="button"
                  className={styles.bulkDropdownTrigger}
                  aria-expanded={bulkMenuOpen}
                  aria-haspopup="listbox"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBulkMenuOpen((o) => !o);
                  }}
                >
                  <span>Bulk Actions</span>
                  <IconDropdownChevron className={styles.bulkDropdownChevron} />
                </button>
                {bulkMenuOpen && (
                  <div
                    className={styles.bulkDropdownMenu}
                    role="listbox"
                    aria-label="Bulk actions"
                    data-name="Menu"
                    data-node-id="3199:5558"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {bulkMenuOptions.map((opt, index) => (
                      <button
                        key={opt.id}
                        type="button"
                        role="option"
                        className={styles.bulkDropdownOption}
                        data-name={`Option ${index + 1}`}
                        data-node-id={opt.nodeId}
                        onClick={() => handleBulkMenuAction(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th} scope="col">
                    <span className={styles.thInner} aria-label="Select rows">
                      <input
                        type="checkbox"
                        className={styles.check}
                        checked={
                          pageRows.length > 0 &&
                          pageRows.every((r) => selected.has(r.id))
                        }
                        onChange={toggleAllOnPage}
                      />
                    </span>
                  </th>
                  <th className={styles.th} scope="col">
                    <span className={styles.thInner}>
                      First Name
                      <IconSort />
                    </span>
                  </th>
                  <th className={styles.th} scope="col">
                    <span className={styles.thInner}>
                      Last Name
                      <IconSort />
                    </span>
                  </th>
                  <th className={styles.th} scope="col">
                    <span className={styles.thInner}>
                      Email
                      <IconSort />
                    </span>
                  </th>
                  <th className={`${styles.th} ${styles.thRole}`} scope="col">
                    <span className={styles.thInner}>
                      Role
                      <IconSort />
                    </span>
                  </th>
                  <th className={styles.th} scope="col">
                    <span className={styles.thInner}>
                      Role Status
                      <IconSort />
                    </span>
                  </th>
                  {showProgramCol && (
                    <th className={styles.th} scope="col">
                      <span className={styles.thInner}>
                        Program
                        <IconSort />
                      </span>
                    </th>
                  )}
                  <th className={styles.th} scope="col">
                    <span className={styles.thInner}>
                      Expiration Date
                      <IconSort />
                    </span>
                  </th>
                  <th className={styles.th} scope="col">
                    <span className={styles.thInner}>
                      Actions
                      <IconSort />
                    </span>
                  </th>
                </tr>
                <tr className={styles.filterRow}>
                  <td />
                  <td>
                    <label
                      className={styles.filterField}
                      htmlFor={`${filterId}-first`}
                    >
                      <IconSearch />
                      <input
                        id={`${filterId}-first`}
                        type="search"
                        name="filterFirstName"
                        autoComplete="off"
                        placeholder="Search"
                        value={qFirst}
                        onChange={(e) => {
                          setQFirst(e.target.value);
                          setPage(1);
                        }}
                        aria-label="Filter first name"
                      />
                    </label>
                  </td>
                  <td>
                    <label
                      className={styles.filterField}
                      htmlFor={`${filterId}-last`}
                    >
                      <IconSearch />
                      <input
                        id={`${filterId}-last`}
                        type="search"
                        name="filterLastName"
                        autoComplete="off"
                        placeholder="Search"
                        value={qLast}
                        onChange={(e) => {
                          setQLast(e.target.value);
                          setPage(1);
                        }}
                        aria-label="Filter last name"
                      />
                    </label>
                  </td>
                  <td>
                    <label
                      className={styles.filterField}
                      htmlFor={`${filterId}-email`}
                    >
                      <IconSearch />
                      <input
                        id={`${filterId}-email`}
                        type="search"
                        name="filterEmail"
                        autoComplete="off"
                        placeholder="Search"
                        value={qEmail}
                        onChange={(e) => {
                          setQEmail(e.target.value);
                          setPage(1);
                        }}
                        aria-label="Filter email"
                      />
                    </label>
                  </td>
                  <td className={styles.filterDropdownCell}>
                    <ColumnMultiSelectFilter
                      id={`${filterId}-role`}
                      options={roleFilterOptions}
                      selected={filterRoles}
                      onChange={(next) => {
                        setFilterRoles(next);
                        setPage(1);
                      }}
                      isOpen={openFilterDropdown === "role"}
                      onOpenChange={(open) =>
                        setOpenFilterDropdown(open ? "role" : null)
                      }
                      aria-label="Filter by role"
                    />
                  </td>
                  <td className={styles.filterDropdownCell}>
                    <ColumnMultiSelectFilter
                      id={`${filterId}-status`}
                      options={STATUS_SELECT_OPTIONS}
                      selected={filterStatuses}
                      onChange={(next) => {
                        setFilterStatuses(next);
                        setPage(1);
                      }}
                      isOpen={openFilterDropdown === "status"}
                      onOpenChange={(open) =>
                        setOpenFilterDropdown(open ? "status" : null)
                      }
                      aria-label="Filter by role status"
                    />
                  </td>
                  {showProgramCol && (
                    <td>
                      <label
                        className={styles.filterField}
                        htmlFor={`${filterId}-program`}
                      >
                        <IconSearch />
                        <input
                          id={`${filterId}-program`}
                          type="search"
                          name="filterProgram"
                          autoComplete="off"
                          placeholder="Search"
                          value={qProgram}
                          onChange={(e) => {
                            setQProgram(e.target.value);
                            setPage(1);
                          }}
                          aria-label="Filter program"
                        />
                      </label>
                    </td>
                  )}
                  <td className={styles.filterDropdownCell}>
                    <ColumnMultiSelectFilter
                      id={`${filterId}-expiration`}
                      options={expirationFilterOptions}
                      selected={filterExpirations}
                      onChange={(next) => {
                        setFilterExpirations(next);
                        setPage(1);
                      }}
                      isOpen={openFilterDropdown === "expiration"}
                      onOpenChange={(open) =>
                        setOpenFilterDropdown(open ? "expiration" : null)
                      }
                      aria-label="Filter by expiration date"
                    />
                  </td>
                  <td />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id} className={styles.row}>
                    <td className={`${styles.td} ${styles.checkCell}`}>
                      <input
                        type="checkbox"
                        className={styles.check}
                        checked={selected.has(r.id)}
                        onChange={() => toggleRow(r.id)}
                        aria-label={`Select ${r.firstName} ${r.lastName}`}
                      />
                    </td>
                    <td className={styles.td}>{r.firstName}</td>
                    <td className={styles.td}>{r.lastName}</td>
                    <td className={styles.td}>{r.email}</td>
                    <td className={`${styles.td} ${styles.tdRole}`}>{r.role}</td>
                    <td className={styles.td}>
                      <StatusBadge status={r.status} />
                    </td>
                    {showProgramCol && (
                      <td
                        className={`${styles.td} ${styles.tdProgram}`}
                        title={r.program}
                      >
                        {r.program}
                      </td>
                    )}
                    <td className={styles.td}>{r.expirationDisplay}</td>
                    <td className={`${styles.td} ${styles.actionsCell}`}>
                      <span className={styles.actionsGlyph} aria-hidden="true">
                        <IconMore />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span>Total Items: {total}</span>
            <div className={styles.paginationSpacer} />
            <div className={styles.pageSize}>
              <span>Items Per Page:</span>
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Items per page"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span>
              Page {page} of {pageCount}
            </span>
            <button
              type="button"
              className={styles.btnSecondary}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next
            </button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          Copyright © AAMC 2025 | 655 K Street, NW, Suite 100, Washington, DC,
          20001-2399 |{" "}
          <a href="#contact">Contact Us</a> | <a href="#follow">Follow Us</a> |{" "}
          <a href="#browsers">Supported Browsers</a> |{" "}
          <a href="#a11y">Web Accessibility</a> |{" "}
          <a href="#terms">AAMC Terms and Conditions</a> |{" "}
          <a href="#privacy">Privacy Statement</a>
        </p>
      </footer>

      <BulkActionDialog
        open={bulkModalAction !== null}
        action={bulkModalAction}
        onClose={() => setBulkModalAction(null)}
        onConfirm={(action: BulkActionConcreteId) =>
          setToastMessage(BULK_ACTION_TOAST[action])
        }
        selectedRows={selectedRows}
        allRows={ALL_ROWS}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
