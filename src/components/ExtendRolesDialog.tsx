import { useEffect, useMemo, useState } from "react";
import styles from "./ExtendRolesDialog.module.css";
import { ScopeRolesSummaryCard } from "./ScopeRolesDetail";

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

export function ExtendRolesDialog() {
  const [notifyUser, setNotifyUser] = useState(false);
  const [scopeRolesOpen, setScopeRolesOpen] = useState(false);

  const assignmentCount = SELECTED_ASSIGNMENTS.length;
  const userCount = DISTINCT_USER_KEYS.length;
  const distinctRoleLabels = Array.from(
    new Set(SELECTED_ASSIGNMENTS.map((r) => r.role)),
  ).length;
  const distinctRoleNames = useMemo(
    () => SELECTED_ASSIGNMENTS.map((r) => r.role),
    [],
  );

  useEffect(() => {
    if (!scopeRolesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setScopeRolesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scopeRolesOpen]);

  return (
    <div className={styles.dialog} data-name="Dialog">
      <header className={styles.header}>
        <h1 className={styles.title}>Extend roles</h1>
        <button type="button" className={styles.iconBtn} aria-label="Close dialog">
          <IconClose />
        </button>
      </header>

      <div className={styles.dialogBody}>
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
        <ScopeRolesSummaryCard
          roleNames={distinctRoleNames}
          open={scopeRolesOpen}
          onOpenChange={setScopeRolesOpen}
          articleClassName={styles.summaryCard}
          distinctCount={distinctRoleLabels}
          idPrefix="extend-scope-roles"
        />
      </div>

      <div className={styles.extendBlock}>
        <h2 className={styles.extendHeading}>Extend</h2>
        <p className={styles.endDateNotice}>
          End date will be set to max allowed date ( Aug 12, 2026)
        </p>
      </div>
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
          Extend roles to Aug 12, 2026
        </button>
      </footer>
    </div>
  );
}
