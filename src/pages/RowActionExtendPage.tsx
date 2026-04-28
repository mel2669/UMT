import { useEffect, useId, useMemo, useState } from "react";
import {
  BulkActionDialog,
  type BulkActionConcreteId,
  type BulkActionId,
  MAX_BULK_ACTION_RECORDS,
  getAllRolesForSelectedUsers,
} from "../components/BulkActionDialog";
import { ColumnMultiSelectFilter } from "../components/ColumnMultiSelectFilter";
import { SelectionLimitDialog } from "../components/SelectionLimitDialog";
import { GrantRolesDialog } from "../components/GrantRolesDialog";
import { RowActionExtendDialog } from "../components/RowActionExtendDialog";
import { RowActionRevokeDialog } from "../components/RowActionRevokeDialog";
import { Toast } from "../components/Toast";
import {
  type ActiveGlobalFilters,
  FILTER_SCENARIOS,
  type FilterScenarioId,
  clearedDraftForScenario,
  defaultScenarioState,
  getScenarioFlags,
} from "../data/filterScenarios";
import {
  APPLICATIONS,
  DEMO_PROGRAM_TITLE,
  INSTITUTIONS,
  programName,
} from "../data/globalFilterCatalog";
import styles from "./RowActionExtendPage.module.css";

type TabId = "all" | "expiring" | "expiredRecent";

/** Matches demo tab rules in `buildGeneratedRows` / base rows. */
function tabMatchForStatus(status: SamUserRow["status"]): TabId[] {
  const tabMatch: TabId[] = ["all"];
  if (status === "expired") tabMatch.push("expiredRecent");
  if (status === "active") tabMatch.push("expiring");
  return tabMatch;
}

const BULK_EXTEND_EXPIRATION = "Aug 12, 2026";

export type SamUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "expired" | "active" | "revoked";
  program: string;
  applicationId: string;
  institutionId: string;
  /** Empty when `program` is not tied to a catalog program (e.g. "—"). */
  programId: string;
  expirationDisplay: string;
  /** Demo tab filters — which views include this row */
  tabMatch: TabId[];
};

const JHU_IM_PROGRAM = programName("prog-jhu-im");
const MAYO_DERM_PROGRAM = programName("prog-mayo-derm");

const BASE_ROWS: SamUserRow[] = [
  {
    id: "1",
    firstName: "Morgan",
    lastName: "Lee",
    email: "morgan.lee@jh.edu",
    role: "Program Coordinator",
    status: "expired",
    program: JHU_IM_PROGRAM,
    applicationId: "eras",
    institutionId: "inst-jhu",
    programId: "prog-jhu-im",
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
    program: JHU_IM_PROGRAM,
    applicationId: "eras",
    institutionId: "inst-jhu",
    programId: "prog-jhu-im",
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
    program: JHU_IM_PROGRAM,
    applicationId: "eras",
    institutionId: "inst-jhu",
    programId: "prog-jhu-im",
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
    program: JHU_IM_PROGRAM,
    applicationId: "eras",
    institutionId: "inst-jhu",
    programId: "prog-jhu-im",
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
    applicationId: "eras",
    institutionId: "inst-jhu",
    programId: "",
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
    program: DEMO_PROGRAM_TITLE,
    applicationId: "eras",
    institutionId: "inst-buffalo",
    programId: "prog-ub-allergy",
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
    program: DEMO_PROGRAM_TITLE,
    applicationId: "eras",
    institutionId: "inst-buffalo",
    programId: "prog-ub-allergy",
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
    program: MAYO_DERM_PROGRAM,
    applicationId: "gme",
    institutionId: "inst-mayo",
    programId: "prog-mayo-derm",
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
    applicationId: "eras",
    institutionId: "inst-jhu",
    programId: "",
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
    program: DEMO_PROGRAM_TITLE,
    applicationId: "eras",
    institutionId: "inst-buffalo",
    programId: "prog-ub-allergy",
    expirationDisplay: "Mar 15, 2027",
    tabMatch: ["all"],
  },
];

const GENERATED_ROWS_COUNT = 200;
const GENERATED_FIRST_NAMES = [
  "Alex",
  "Taylor",
  "Jordan",
  "Casey",
  "Riley",
  "Morgan",
  "Avery",
  "Parker",
];
const GENERATED_LAST_NAMES = [
  "Adams",
  "Bennett",
  "Campbell",
  "Diaz",
  "Edwards",
  "Foster",
  "Garcia",
  "Hayes",
  "Ingram",
  "Johnson",
];
const GENERATED_ROLES = [
  "Program Coordinator",
  "Program Super User",
  "Reviewer/interviewer",
  "Institution Super User",
  "Alternate Program Super User",
  "Alternate Institution Super User",
];
const GENERATED_STATUSES: SamUserRow["status"][] = [
  "active",
  "expired",
  "revoked",
];
const GENERATED_EXPIRATIONS = [
  "Jan 15, 2027",
  "Feb 20, 2027",
  "Mar 10, 2027",
  "Apr 25, 2027",
  "May 18, 2027",
  "Jun 30, 2027",
];

const GLOBAL_ROW_PROFILES: Pick<
  SamUserRow,
  "applicationId" | "institutionId" | "programId" | "program"
>[] = [
  {
    applicationId: "eras",
    institutionId: "inst-jhu",
    programId: "prog-jhu-im",
    program: JHU_IM_PROGRAM,
  },
  {
    applicationId: "eras",
    institutionId: "inst-buffalo",
    programId: "prog-ub-allergy",
    program: DEMO_PROGRAM_TITLE,
  },
  {
    applicationId: "gme",
    institutionId: "inst-mayo",
    programId: "prog-mayo-derm",
    program: MAYO_DERM_PROGRAM,
  },
];

function pruneGlobalFilters(
  rows: SamUserRow[],
  next: ActiveGlobalFilters,
): ActiveGlobalFilters {
  const appSet = new Set(next.appIds);
  const instIds = next.instIds.filter((id) =>
    rows.some(
      (r) =>
        r.institutionId === id &&
        (next.appIds.length === 0 || appSet.has(r.applicationId)),
    ),
  );
  const instSet = new Set(instIds);
  const progIds = next.progIds.filter((pid) =>
    rows.some((r) => {
      if (r.programId !== pid) return false;
      if (next.appIds.length && !appSet.has(r.applicationId)) return false;
      if (instIds.length && !instSet.has(r.institutionId)) return false;
      return true;
    }),
  );
  return { appIds: next.appIds, instIds, progIds };
}

function buildGeneratedRows(count: number): SamUserRow[] {
  return Array.from({ length: count }, (_, index) => {
    const rowNumber = index + 11;
    const firstName = GENERATED_FIRST_NAMES[index % GENERATED_FIRST_NAMES.length];
    const lastName =
      GENERATED_LAST_NAMES[Math.floor(index / 2) % GENERATED_LAST_NAMES.length];
    const role = GENERATED_ROLES[index % GENERATED_ROLES.length];
    const status = GENERATED_STATUSES[index % GENERATED_STATUSES.length];
    const expirationDisplay =
      GENERATED_EXPIRATIONS[index % GENERATED_EXPIRATIONS.length];

    const tabMatch: TabId[] = ["all"];
    if (status === "expired") tabMatch.push("expiredRecent");
    if (status === "active") tabMatch.push("expiring");

    const profile = GLOBAL_ROW_PROFILES[index % GLOBAL_ROW_PROFILES.length];
    const noProg = index % 5 === 0;

    return {
      id: String(rowNumber),
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rowNumber}@jh.edu`,
      role,
      status,
      program: noProg ? "-" : profile.program,
      applicationId: profile.applicationId,
      institutionId: profile.institutionId,
      programId: noProg ? "" : profile.programId,
      expirationDisplay,
      tabMatch,
    };
  });
}

function createInitialRows(): SamUserRow[] {
  return [...BASE_ROWS, ...buildGeneratedRows(GENERATED_ROWS_COUNT)];
}

function samePerson(
  a: Pick<SamUserRow, "firstName" | "lastName">,
  b: Pick<SamUserRow, "firstName" | "lastName">,
) {
  return a.firstName === b.firstName && a.lastName === b.lastName;
}

function maxNumericRowId(rows: SamUserRow[]): number {
  let max = 0;
  for (const r of rows) {
    const n = Number.parseInt(r.id, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return max;
}

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
  { id: "revoke-selected", label: "Revoke selected roles", nodeId: "3199:5575" },
] as const;

const ROW_ACTION_OPTIONS_ACTIVE = ["Grant", "Revoke", "Extend"] as const;
const ROW_ACTION_OPTIONS_REVOKED = ["Reinstate"] as const;

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

const DEFAULT_FILTER_SCENARIO: FilterScenarioId = "multi-app-prog-inst";

export function RowActionExtendPage() {
  const [rows, setRows] = useState<SamUserRow[]>(() => createInitialRows());
  const [filterScenario, setFilterScenario] = useState<FilterScenarioId>(
    DEFAULT_FILTER_SCENARIO,
  );
  const [activeGlobalFilters, setActiveGlobalFilters] =
    useState<ActiveGlobalFilters>(
      () => defaultScenarioState(DEFAULT_FILTER_SCENARIO).active,
    );
  const [draftGlobalFilters, setDraftGlobalFilters] =
    useState<ActiveGlobalFilters>(
      () => defaultScenarioState(DEFAULT_FILTER_SCENARIO).draft,
    );
  const [requireEmptyProgram, setRequireEmptyProgram] = useState(
    () => defaultScenarioState(DEFAULT_FILTER_SCENARIO).requireEmptyProgram,
  );
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
    null | "role" | "status" | "expiration" | "globalApp" | "globalInst" | "globalProg"
  >(null);
  const filterId = useId();
  const scenarioSelectId = useId();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [rowActionMenuOpenId, setRowActionMenuOpenId] = useState<string | null>(
    null,
  );
  const [bulkModalAction, setBulkModalAction] = useState<BulkActionId | null>(
    null,
  );
  const [selectionLimitAttemptedCount, setSelectionLimitAttemptedCount] =
    useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [grantRolesAnchorRow, setGrantRolesAnchorRow] =
    useState<SamUserRow | null>(null);
  const [extendRoleAnchorRow, setExtendRoleAnchorRow] =
    useState<SamUserRow | null>(null);
  const [reinstateRoleAnchorRow, setReinstateRoleAnchorRow] =
    useState<SamUserRow | null>(null);
  const [revokeRoleAnchorRow, setRevokeRoleAnchorRow] =
    useState<SamUserRow | null>(null);
  const bulkMenuOptions = BULK_MENU_OPTIONS_SCOPE_FIRST;
  const {
    appReadOnly,
    instReadOnly,
    progReadOnly,
    showProgramFilter: showGlobalProgramFilter,
    showGlobalFiltersCard,
    hideApplyRow,
  } = getScenarioFlags(filterScenario);

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected],
  );
  const selectedCount = selectedRows.length;

  useEffect(() => {
    if (!bulkMenuOpen && !rowActionMenuOpenId) return;
    const close = () => setBulkMenuOpen(false);
    const closeMenus = () => {
      close();
      setRowActionMenuOpenId(null);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, [bulkMenuOpen, rowActionMenuOpenId]);

  useEffect(() => {
    if (!toastMessage) return;
    const id = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(id);
  }, [toastMessage]);

  const rowsAfterGlobal = useMemo(() => {
    return rows.filter((r) => {
      if (tab !== "all" && !r.tabMatch.includes(tab)) return false;
      if (
        activeGlobalFilters.appIds.length &&
        !activeGlobalFilters.appIds.includes(r.applicationId)
      )
        return false;
      if (
        activeGlobalFilters.instIds.length &&
        !activeGlobalFilters.instIds.includes(r.institutionId)
      )
        return false;
      if (
        activeGlobalFilters.progIds.length &&
        !activeGlobalFilters.progIds.includes(r.programId)
      )
        return false;
      if (requireEmptyProgram && r.programId) return false;
      return true;
    });
  }, [rows, tab, activeGlobalFilters, requireEmptyProgram]);

  const applicationFilterOptions = useMemo(() => {
    const seen = new Set(
      rows.map((r) => r.applicationId).filter((id) => id.length > 0),
    );
    return APPLICATIONS.filter((a) => seen.has(a.id)).map((a) => ({
      value: a.id,
      label: a.name,
    }));
  }, [rows]);

  const institutionFilterOptions = useMemo(() => {
    const apps = draftGlobalFilters.appIds;
    const seen = new Set<string>();
    for (const r of rows) {
      if (!r.institutionId) continue;
      if (apps.length && !apps.includes(r.applicationId)) continue;
      seen.add(r.institutionId);
    }
    return INSTITUTIONS.filter((i) => seen.has(i.id)).map((i) => ({
      value: i.id,
      label: i.name,
    }));
  }, [rows, draftGlobalFilters.appIds]);

  const programFilterOptions = useMemo(() => {
    const apps = draftGlobalFilters.appIds;
    const insts = draftGlobalFilters.instIds;
    const seen = new Set<string>();
    for (const r of rows) {
      if (!r.programId) continue;
      if (apps.length && !apps.includes(r.applicationId)) continue;
      if (insts.length && !insts.includes(r.institutionId)) continue;
      seen.add(r.programId);
    }
    const opts = [...seen].map((id) => ({
      value: id,
      label: programName(id),
    }));
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [rows, draftGlobalFilters.appIds, draftGlobalFilters.instIds]);

  const roleFilterOptions = useMemo(() => {
    const roles = [...new Set(rowsAfterGlobal.map((r) => r.role))].sort((a, b) =>
      a.localeCompare(b),
    );
    return roles.map((r) => ({ value: r, label: r }));
  }, [rowsAfterGlobal]);

  const expirationFilterOptions = useMemo(() => {
    const dates = [...new Set(rowsAfterGlobal.map((r) => r.expirationDisplay))].sort(
      (a, b) => a.localeCompare(b, undefined, { numeric: true }),
    );
    return dates.map((d) => ({ value: d, label: d }));
  }, [rowsAfterGlobal]);

  const hasUnappliedGlobal =
    JSON.stringify(draftGlobalFilters) !== JSON.stringify(activeGlobalFilters);

  useEffect(() => {
    if (!hideApplyRow) return;
    setActiveGlobalFilters(draftGlobalFilters);
  }, [draftGlobalFilters, hideApplyRow]);

  const filtered = useMemo(() => {
    return rowsAfterGlobal.filter((r) => {
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
    rowsAfterGlobal,
    qFirst,
    qLast,
    qEmail,
    qProgram,
    filterRoles,
    filterStatuses,
    filterExpirations,
  ]);

  const pageContext = useMemo(() => {
    if (filterScenario === "single-inst-single-prog") {
      return {
        crumb1: APPLICATIONS.find((a) => a.id === "eras")?.name ?? "ERAS",
        crumb2:
          INSTITUTIONS.find((i) => i.id === "inst-buffalo")?.name ?? "Institution",
        title: DEMO_PROGRAM_TITLE,
      };
    }
    if (filterScenario === "single-inst-no-prog") {
      const inst = INSTITUTIONS.find((i) => i.id === "inst-jhu");
      return {
        crumb1: APPLICATIONS.find((a) => a.id === "eras")?.name ?? "ERAS",
        crumb2: inst?.name ?? "Institution",
        title: `${inst?.name ?? "Institution"} — institution roles`,
      };
    }
    const { appIds, instIds, progIds } = activeGlobalFilters;
    const crumb1 =
      appIds.length === 1
        ? (APPLICATIONS.find((a) => a.id === appIds[0])?.name ?? appIds[0])
        : appIds.length === 0
          ? "All applications"
          : "Multiple applications";
    const crumb2 =
      instIds.length === 1
        ? (INSTITUTIONS.find((i) => i.id === instIds[0])?.name ?? instIds[0])
        : instIds.length === 0
          ? "All institutions"
          : "Multiple institutions";
    let title = "Program users";
    if (progIds.length === 1) title = programName(progIds[0]);
    else if (instIds.length === 1)
      title = INSTITUTIONS.find((i) => i.id === instIds[0])?.name ?? title;
    else if (appIds.length === 1)
      title = APPLICATIONS.find((a) => a.id === appIds[0])?.name ?? title;
    return { crumb1, crumb2, title };
  }, [filterScenario, activeGlobalFilters]);

  const patchDraft = (patch: Partial<ActiveGlobalFilters>) => {
    setDraftGlobalFilters((prev) =>
      pruneGlobalFilters(rows, { ...prev, ...patch }),
    );
    setPage(1);
  };

  const handleScenarioChange = (next: FilterScenarioId) => {
    setFilterScenario(next);
    const baseline = defaultScenarioState(next);
    setActiveGlobalFilters(baseline.active);
    setDraftGlobalFilters(baseline.draft);
    setRequireEmptyProgram(baseline.requireEmptyProgram);
    setFilterRoles([]);
    setFilterStatuses([]);
    setFilterExpirations([]);
    setQFirst("");
    setQLast("");
    setQEmail("");
    setQProgram("");
    setOpenFilterDropdown(null);
    setPage(1);
  };

  const applyGlobalFilters = () => {
    setActiveGlobalFilters(pruneGlobalFilters(rows, draftGlobalFilters));
    setOpenFilterDropdown(null);
    setPage(1);
  };

  const clearGlobalFilters = () => {
    const cleared = clearedDraftForScenario(filterScenario);
    const pruned = pruneGlobalFilters(rows, cleared);
    setDraftGlobalFilters(pruned);
    setActiveGlobalFilters(pruned);
    setOpenFilterDropdown(null);
    setPage(1);
  };

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
    if (selectedCount === 0) {
      window.alert("Select one or more rows first.");
      return;
    }
    if (selectedCount > MAX_BULK_ACTION_RECORDS) {
      setSelectionLimitAttemptedCount(selectedCount);
      return;
    }

    const allApplicableRoleCount = getAllRolesForSelectedUsers(
      selectedRows,
      rows,
    ).length;
    const checksApplicableRoleLimit =
      optionId === "extend-all-users" ||
      optionId === "revoke-all-users";
    if (
      checksApplicableRoleLimit &&
      allApplicableRoleCount > MAX_BULK_ACTION_RECORDS
    ) {
      setSelectionLimitAttemptedCount(allApplicableRoleCount);
      return;
    }

    setBulkModalAction(optionId);
  };

  const handleBulkConfirm = (action: BulkActionConcreteId) => {
    const selectedIds = new Set(selectedRows.map((r) => r.id));
    const selectedUserKeys = new Set(
      selectedRows.map((r) => `${r.firstName}\u0000${r.lastName}`),
    );

    setRows((prev) =>
      prev.map((r) => {
        const userKey = `${r.firstName}\u0000${r.lastName}`;
        if (action === "extend-selected" || action === "revoke-selected") {
          if (!selectedIds.has(r.id)) return r;
        } else if (
          action === "extend-all-users" ||
          action === "revoke-all-users"
        ) {
          if (!selectedUserKeys.has(userKey)) return r;
        }

        if (action === "extend-selected" || action === "extend-all-users") {
          return {
            ...r,
            status: "active",
            expirationDisplay: BULK_EXTEND_EXPIRATION,
            tabMatch: tabMatchForStatus("active"),
          };
        }
        return {
          ...r,
          status: "revoked",
          tabMatch: tabMatchForStatus("revoked"),
        };
      }),
    );
    setToastMessage(BULK_ACTION_TOAST[action]);
  };

  const handleGrantRolesConfirm = (roleNames: string[]) => {
    const anchor = grantRolesAnchorRow;
    if (!anchor || roleNames.length === 0) return;

    const uniqueRoles = [...new Set(roleNames)];

    setRows((prev) => {
      const next = [...prev];
      let idCursor = maxNumericRowId(next);

      for (const role of uniqueRoles) {
        const activeIdx = next.findIndex(
          (r) =>
            samePerson(r, anchor) &&
            r.role === role &&
            r.status === "active",
        );
        if (activeIdx !== -1) continue;

        const renewIdx = next.findIndex(
          (r) =>
            samePerson(r, anchor) &&
            r.role === role &&
            (r.status === "expired" || r.status === "revoked"),
        );

        if (renewIdx !== -1) {
          const r = next[renewIdx];
          next[renewIdx] = {
            ...r,
            status: "active",
            expirationDisplay: BULK_EXTEND_EXPIRATION,
            tabMatch: tabMatchForStatus("active"),
          };
          continue;
        }

        idCursor += 1;
        next.push({
          id: String(idCursor),
          firstName: anchor.firstName,
          lastName: anchor.lastName,
          email: anchor.email,
          role,
          status: "active",
          program: anchor.program,
          applicationId: anchor.applicationId,
          institutionId: anchor.institutionId,
          programId: anchor.programId,
          expirationDisplay: BULK_EXTEND_EXPIRATION,
          tabMatch: tabMatchForStatus("active"),
        });
      }

      return next;
    });

    const n = uniqueRoles.length;
    setToastMessage(
      n === 1
        ? `Granted role: ${uniqueRoles[0]}.`
        : `Granted ${n} roles: ${uniqueRoles.join(", ")}.`,
    );
  };

  const handleExtendRoleConfirm = (payload: {
    endDateDisplay: string;
    notifyUser: boolean;
  }) => {
    const anchor = extendRoleAnchorRow;
    if (!anchor) return;

    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== anchor.id) return r;
        return {
          ...r,
          status: "active",
          expirationDisplay: payload.endDateDisplay,
          tabMatch: tabMatchForStatus("active"),
        };
      }),
    );

    const notifySuffix = payload.notifyUser ? " User notified." : "";
    setToastMessage(
      `Extended ${anchor.role} for ${anchor.firstName} ${anchor.lastName} to ${payload.endDateDisplay}.${notifySuffix}`,
    );
  };

  const handleReinstateRoleConfirm = (payload: {
    endDateDisplay: string;
    notifyUser: boolean;
  }) => {
    const anchor = reinstateRoleAnchorRow;
    if (!anchor) return;

    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== anchor.id) return r;
        return {
          ...r,
          status: "active",
          expirationDisplay: payload.endDateDisplay,
          tabMatch: tabMatchForStatus("active"),
        };
      }),
    );

    const notifySuffix = payload.notifyUser ? " User notified." : "";
    setToastMessage(
      `Reinstated ${anchor.role} for ${anchor.firstName} ${anchor.lastName} to ${payload.endDateDisplay}.${notifySuffix}`,
    );
  };

  const handleRevokeRoleConfirm = () => {
    const anchor = revokeRoleAnchorRow;
    if (!anchor) return;

    setRows((prev) =>
      prev.map((r) =>
        r.id !== anchor.id
          ? r
          : {
              ...r,
              status: "revoked",
              tabMatch: tabMatchForStatus("revoked"),
            },
      ),
    );
    setToastMessage(
      `Revoked ${anchor.role} for ${anchor.firstName} ${anchor.lastName}.`,
    );
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
          <div className={styles.primaryNavBrand}>
            <div className={styles.logoBlock}>
              <span className={styles.logoMark}>AAMC</span>
              <span>User management tool</span>
            </div>
            <div className={styles.navScenario}>
              
              <select
                id={scenarioSelectId}
                name="filterScenario"
                className={styles.navScenarioSelect}
                value={filterScenario}
                onChange={(e) =>
                  handleScenarioChange(e.target.value as FilterScenarioId)
                }
              >
                {FILTER_SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
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
          <span>{pageContext.crumb1}</span>
          <span aria-hidden>›</span>
          <span>{pageContext.crumb2}</span>
        </div>
        <h1 className={styles.pageTitle}>{pageContext.title}</h1>

        {showGlobalFiltersCard && (
          <section
            className={`${styles.card} ${styles.globalFiltersSection}`}
            aria-label="Global filters"
          >
            <div className={styles.globalFilterGrid}>
              <div className={styles.globalFilterField}>
                <span className={styles.globalFilterLabel}>Application</span>
                <ColumnMultiSelectFilter
                  id={`${filterId}-global-app`}
                  options={applicationFilterOptions}
                  selected={draftGlobalFilters.appIds}
                  onChange={(next) => patchDraft({ appIds: next })}
                  isOpen={openFilterDropdown === "globalApp" && !appReadOnly}
                  onOpenChange={(open) =>
                    setOpenFilterDropdown(open ? "globalApp" : null)
                  }
                  aria-label="Filter by application"
                  disabled={appReadOnly}
                />
              </div>
              <div className={styles.globalFilterField}>
                <span className={styles.globalFilterLabel}>Institution</span>
                <ColumnMultiSelectFilter
                  id={`${filterId}-global-inst`}
                  options={institutionFilterOptions}
                  selected={draftGlobalFilters.instIds}
                  onChange={(next) => patchDraft({ instIds: next })}
                  isOpen={openFilterDropdown === "globalInst" && !instReadOnly}
                  onOpenChange={(open) =>
                    setOpenFilterDropdown(open ? "globalInst" : null)
                  }
                  aria-label="Filter by institution"
                  disabled={instReadOnly}
                />
              </div>
              {showGlobalProgramFilter && (
                <div className={styles.globalFilterField}>
                  <span className={styles.globalFilterLabel}>Program</span>
                  <ColumnMultiSelectFilter
                    id={`${filterId}-global-prog`}
                    options={programFilterOptions}
                    selected={draftGlobalFilters.progIds}
                    onChange={(next) => patchDraft({ progIds: next })}
                    isOpen={openFilterDropdown === "globalProg" && !progReadOnly}
                    onOpenChange={(open) =>
                      setOpenFilterDropdown(open ? "globalProg" : null)
                    }
                    aria-label="Filter by program"
                    disabled={progReadOnly}
                  />
                </div>
              )}
            </div>
            {!hideApplyRow && (
              <div className={styles.globalFilterActions}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={clearGlobalFilters}
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={!hasUnappliedGlobal}
                  onClick={applyGlobalFilters}
                >
                  Apply filters
                </button>
              </div>
            )}
          </section>
        )}

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
              <div className={styles.toolbarSelectionActions}>
                {selectedCount > 0 && (
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => {
                      setSelected(new Set());
                      setBulkMenuOpen(false);
                    }}
                  >
                    Deselect All
                  </button>
                )}
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
                  <span>
                    Bulk Actions
                    {selectedCount > 0 ? ` (${selectedCount})` : ""}
                  </span>
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
                      <div className={styles.rowActionMenuWrap}>
                        <button
                          type="button"
                          className={styles.actionsButton}
                          aria-label={`Actions for ${r.firstName} ${r.lastName}`}
                          aria-haspopup="menu"
                          aria-expanded={rowActionMenuOpenId === r.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRowActionMenuOpenId((current) =>
                              current === r.id ? null : r.id,
                            );
                          }}
                        >
                          <span className={styles.actionsGlyph} aria-hidden="true">
                            <IconMore />
                          </span>
                        </button>
                        {rowActionMenuOpenId === r.id && (
                          <div
                            className={styles.rowActionMenu}
                            role="menu"
                            aria-label="Row actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(r.status === "revoked"
                              ? ROW_ACTION_OPTIONS_REVOKED
                              : ROW_ACTION_OPTIONS_ACTIVE
                            ).map((actionLabel) => (
                              <button
                                key={actionLabel}
                                type="button"
                                role="menuitem"
                                className={styles.rowActionOption}
                                onClick={() => {
                                  setRowActionMenuOpenId(null);
                                  if (actionLabel === "Grant") {
                                    setGrantRolesAnchorRow(r);
                                  }
                                  if (actionLabel === "Extend") {
                                    setExtendRoleAnchorRow(r);
                                  }
                                  if (actionLabel === "Reinstate") {
                                    setReinstateRoleAnchorRow(r);
                                  }
                                  if (actionLabel === "Revoke") {
                                    setRevokeRoleAnchorRow(r);
                                  }
                                }}
                              >
                                {actionLabel}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
                {[10, 25, 50, 100].map((n) => (
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
        onConfirm={handleBulkConfirm}
        selectedRows={selectedRows}
        allRows={rows}
        recordLimit={MAX_BULK_ACTION_RECORDS}
        onRecordLimitExceeded={(attemptedCount) => {
          setBulkModalAction(null);
          setSelectionLimitAttemptedCount(attemptedCount);
        }}
      />

      <SelectionLimitDialog
        open={selectionLimitAttemptedCount !== null}
        attemptedCount={selectionLimitAttemptedCount}
        limit={MAX_BULK_ACTION_RECORDS}
        onClose={() => setSelectionLimitAttemptedCount(null)}
      />

      <GrantRolesDialog
        open={grantRolesAnchorRow !== null}
        anchorRow={grantRolesAnchorRow}
        allRows={rows}
        onClose={() => setGrantRolesAnchorRow(null)}
        onConfirm={handleGrantRolesConfirm}
      />

      <RowActionExtendDialog
        open={extendRoleAnchorRow !== null}
        row={extendRoleAnchorRow}
        maxDateDisplay={BULK_EXTEND_EXPIRATION}
        onClose={() => setExtendRoleAnchorRow(null)}
        onConfirm={handleExtendRoleConfirm}
      />

      <RowActionExtendDialog
        open={reinstateRoleAnchorRow !== null}
        row={reinstateRoleAnchorRow}
        maxDateDisplay={BULK_EXTEND_EXPIRATION}
        mode="reinstate"
        onClose={() => setReinstateRoleAnchorRow(null)}
        onConfirm={handleReinstateRoleConfirm}
      />

      <RowActionRevokeDialog
        open={revokeRoleAnchorRow !== null}
        row={revokeRoleAnchorRow}
        onClose={() => setRevokeRoleAnchorRow(null)}
        onConfirm={handleRevokeRoleConfirm}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
