import { useMemo, useState } from "react";
import styles from "./ExtendRolesDialog.module.css";

export type RoleStatus = "expired" | "active";

export type AssignmentRow = {
  role: string;
  firstName: string;
  lastName: string;
  status: RoleStatus;
  expirationDate: string;
};

/** The six role assignments explicitly selected for extension (matches design). */
const SELECTED_ASSIGNMENTS: AssignmentRow[] = [
  {
    role: "Program Coordinator",
    firstName: "Abshier",
    lastName: "Hoganson",
    status: "expired",
    expirationDate: "Aug 22, 2025",
  },
  {
    role: "Reviewer/interviewer",
    firstName: "Abshier",
    lastName: "Hoganson",
    status: "expired",
    expirationDate: "Aug 15, 2026",
  },
  {
    role: "Program Super User",
    firstName: "Thomas",
    lastName: "Lalaria",
    status: "expired",
    expirationDate: "Aug 17, 2025",
  },
  {
    role: "Reviewer/interviewer",
    firstName: "Charles",
    lastName: "Lalaria",
    status: "active",
    expirationDate: "Aug 17, 2026",
  },
  {
    role: "Institution Super User",
    firstName: "Emily",
    lastName: "Hoganmoody",
    status: "active",
    expirationDate: "Aug 19, 2026",
  },
  {
    role: "Program Super User",
    firstName: "Rachel",
    lastName: "Hoganson",
    status: "active",
    expirationDate: "Aug 15, 2026",
  },
];

/**
 * Every role for each user that appears in the selection — includes roles beyond
 * the six assignments so the table can list multiple rows per person.
 */
const ALL_ROLES_FOR_SELECTED_USERS: AssignmentRow[] = [
  // Abshier Hoganson — 3 roles
  SELECTED_ASSIGNMENTS[0],
  SELECTED_ASSIGNMENTS[1],
  {
    role: "Reporting Analyst",
    firstName: "Abshier",
    lastName: "Hoganson",
    status: "active",
    expirationDate: "Nov 30, 2026",
  },
  // Thomas Lalaria — 2 roles
  SELECTED_ASSIGNMENTS[2],
  {
    role: "Curriculum Editor",
    firstName: "Thomas",
    lastName: "Lalaria",
    status: "active",
    expirationDate: "Sep 1, 2026",
  },
  // Charles Lalaria — 2 roles
  SELECTED_ASSIGNMENTS[3],
  {
    role: "Site Visitor",
    firstName: "Charles",
    lastName: "Lalaria",
    status: "active",
    expirationDate: "Oct 3, 2026",
  },
  // Emily Hoganmoody — 2 roles
  SELECTED_ASSIGNMENTS[4],
  {
    role: "Faculty Reviewer",
    firstName: "Emily",
    lastName: "Hoganmoody",
    status: "expired",
    expirationDate: "Jul 1, 2025",
  },
  // Rachel Hoganson — 2 roles
  SELECTED_ASSIGNMENTS[5],
  {
    role: "Audit Viewer",
    firstName: "Rachel",
    lastName: "Hoganson",
    status: "active",
    expirationDate: "Jan 15, 2027",
  },
];

const DISTINCT_USER_KEYS = Array.from(
  new Set(
    SELECTED_ASSIGNMENTS.map((r) => `${r.firstName}\u0000${r.lastName}`),
  ),
);

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

function IconSort() {
  return (
    <svg className={styles.sortIcon} viewBox="0 0 12 12" aria-hidden>
      <path
        fill="currentColor"
        d="M6 1 9.5 5h-7L6 1Zm0 10L2.5 7h7L6 11Z"
        opacity="0.45"
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

/** Calendar glyph aligned with Figma Dialog 2 — Icon/Date-Day */
function IconDateDay({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M4.5 1a.75.75 0 0 1 .75.75V2.5h1.5V1.75a.75.75 0 0 1 1.5 0V2.5H9V1.75a.75.75 0 0 1 1.5 0V2.5h.75A1.75 1.75 0 0 1 13 4.25v9.5A1.75 1.75 0 0 1 11.25 15.5h-8.5A1.75 1.75 0 0 1 1 13.75v-9.5C1 3.56 1.56 3 2.25 3H3V1.75A.75.75 0 0 1 4.5 1ZM2.5 6.5v7.25c0 .14.11.25.25.25h8.5a.25.25 0 0 0 .25-.25V6.5h-9Z"
      />
    </svg>
  );
}

function RadioSelected() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="#fff" stroke="#006a72" strokeWidth="2" />
      <circle cx="10" cy="10" r="5" fill="#006a72" />
    </svg>
  );
}

function RadioUnselected() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="#fff" stroke="#808080" strokeWidth="1" />
    </svg>
  );
}

function StatusBadge({ status }: { status: RoleStatus }) {
  if (status === "expired") {
    return (
      <span className={`${styles.badge} ${styles.badgeAlert}`}>
        <IconIssue />
        Expired
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

export function ExtendRolesDialog() {
  const [tableMode, setTableMode] = useState<"assignments" | "allRoles">(
    "assignments",
  );
  const [endDateChoice, setEndDateChoice] = useState<"max" | "custom">("max");
  /** ISO date string (yyyy-mm-dd) for native date input */
  const [customEndDate, setCustomEndDate] = useState("");
  const [notifyUser, setNotifyUser] = useState(false);

  const tableRows = useMemo(
    () =>
      tableMode === "assignments"
        ? SELECTED_ASSIGNMENTS
        : ALL_ROLES_FOR_SELECTED_USERS,
    [tableMode],
  );

  const assignmentCount = SELECTED_ASSIGNMENTS.length;
  const allRolesCount = ALL_ROLES_FOR_SELECTED_USERS.length;
  const userCount = DISTINCT_USER_KEYS.length;
  const distinctRoleLabels = Array.from(
    new Set(SELECTED_ASSIGNMENTS.map((r) => r.role)),
  ).length;

  return (
    <div className={styles.dialog} data-name="Dialog">
      <header className={styles.header}>
        <h1 className={styles.title}>Extend roles</h1>
        <button type="button" className={styles.iconBtn} aria-label="Close dialog">
          <IconClose />
        </button>
      </header>

      <p className={styles.intro}>
        Review all {assignmentCount} assignments that will be extended across{" "}
        {userCount} users and {distinctRoleLabels} roles.
      </p>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <div className={styles.cardAccent} />
          <div className={styles.cardBody}>
            <p className={styles.cardKicker}>Impact</p>
            <p className={styles.cardNumber}>{assignmentCount}</p>
            <p className={styles.cardSub}>Role assignments affected</p>
          </div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.cardAccent} />
          <div className={styles.cardBody}>
            <p className={styles.cardKicker}>Users affected</p>
            <p className={styles.cardNumber}>{userCount}</p>
            <p className={styles.cardSub}>Users total</p>
          </div>
        </article>
        <article className={styles.summaryCard}>
          <div className={styles.cardAccent} />
          <div className={styles.cardBody}>
            <p className={styles.cardKicker}>Scope</p>
            <p className={styles.cardNumber}>{distinctRoleLabels}</p>
            <p className={styles.cardSub}>Distinct roles</p>
          </div>
        </article>
      </div>

      <div className={styles.extendBlock}>
        <h2 className={styles.extendHeading}>Extend</h2>
        <div
          className={styles.segment}
          role="group"
          aria-label="Choose which roles to show in the table"
        >
          <button
            type="button"
            className={`${styles.segmentBtn} ${
              tableMode === "assignments" ? styles.segmentBtnActive : ""
            }`}
            aria-pressed={tableMode === "assignments"}
            onClick={() => setTableMode("assignments")}
          >
            Selected role assignments ({assignmentCount})
          </button>
          <button
            type="button"
            className={`${styles.segmentBtn} ${
              tableMode === "allRoles" ? styles.segmentBtnActive : ""
            }`}
            aria-pressed={tableMode === "allRoles"}
            onClick={() => setTableMode("allRoles")}
          >
            All roles for selected users ({allRolesCount})
          </button>
        </div>

        <div className={styles.radioGroup} role="radiogroup" aria-label="End date">
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="endDate"
              checked={endDateChoice === "max"}
              onChange={() => setEndDateChoice("max")}
            />
            <span className={styles.radioVisual} aria-hidden>
              {endDateChoice === "max" ? <RadioSelected /> : <RadioUnselected />}
            </span>
            <span className={styles.radioText}>
              Set end date to max allowed date (Aug 12, 2026)
            </span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="endDate"
              checked={endDateChoice === "custom"}
              onChange={() => setEndDateChoice("custom")}
            />
            <span className={styles.radioVisual} aria-hidden>
              {endDateChoice === "custom" ? <RadioSelected /> : <RadioUnselected />}
            </span>
            <span className={styles.radioText}>Select or enter end date</span>
          </label>
        </div>

        {endDateChoice === "custom" && (
          <div
            className={styles.dateField}
            data-name="Form Field / Datepicker"
            data-node-id="9:524"
          >
            <div className={styles.dateInputRow}>
              <input
                id="extend-end-date"
                type="date"
                className={`${styles.dateInput} ${
                  !customEndDate ? styles.dateInputEmpty : ""
                }`}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                aria-label="End date"
              />
              <IconDateDay className={styles.dateInputIcon} />
            </div>
            <p className={styles.dateHint}>MMM DD, YYYY</p>
          </div>
        )}
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} scope="col">
                <span className={styles.thInner}>
                  Role
                  <IconSort />
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
                  Role Status
                  <IconSort />
                </span>
              </th>
              <th className={styles.th} scope="col">
                <span className={styles.thInner}>
                  Expiration Date
                  <IconSort />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={`${tableMode}-${row.role}-${row.firstName}-${row.lastName}-${row.expirationDate}-${i}`} className={styles.row}>
                <td className={styles.td}>{row.role}</td>
                <td className={styles.td}>{row.firstName}</td>
                <td className={styles.td}>{row.lastName}</td>
                <td className={`${styles.td} ${styles.statusCell}`}>
                  <StatusBadge status={row.status} />
                </td>
                <td className={styles.td}>{row.expirationDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className={styles.footer}>
        <label className={styles.notify}>
          <input
            type="checkbox"
            checked={notifyUser}
            onChange={(e) => setNotifyUser(e.target.checked)}
          />
          <span>Notify User</span>
        </label>
        <button type="button" className={styles.btnGhost}>
          Cancel
        </button>
        <button type="button" className={styles.btnPrimary}>
          Extend roles
        </button>
      </footer>
    </div>
  );
}
