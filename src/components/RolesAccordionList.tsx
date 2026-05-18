import grantStyles from "./GrantRolesDialog.module.css";
import styles from "./RolesAccordionList.module.css";

export type RolesAccordionRole = {
  label: string;
  status: "active" | "expired" | "revoked";
};

export type RolesAccordionPanelProps = {
  title: string;
  roles: readonly RolesAccordionRole[];
  id: string;
  defaultOpen?: boolean;
  headingLevel?: "h2" | "h3";
};

export type RolesAccordionListProps = {
  panels: readonly RolesAccordionPanelProps[];
};

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

function IconIssue() {
  return (
    <svg className={grantStyles.badgeIcon} viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 10.5h-1.5v-1.5h1.5v1.5Zm0-3h-1.5V4.5h1.5V8.5Z"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className={grantStyles.badgeIcon} viewBox="0 0 16 16" aria-hidden>
      <path
        fill="currentColor"
        d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm3.2 5.23-4 4.5a1 1 0 0 1-1.45.05L4.8 9.8a1 1 0 1 1 1.4-1.42l.8.8 3.2-3.6a1 1 0 0 1 1.48 1.35Z"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: RolesAccordionRole["status"] }) {
  if (status === "active") {
    return (
      <span className={`${grantStyles.badge} ${grantStyles.badgeOk}`}>
        <IconCheck />
        Active
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className={`${grantStyles.badge} ${grantStyles.badgeAlert}`}>
        <IconIssue />
        Expired
      </span>
    );
  }
  return (
    <span className={`${grantStyles.badge} ${grantStyles.badgeNeutral}`}>
      <IconIssue />
      Revoked
    </span>
  );
}

function ReadOnlyRoleRow({ role }: { role: RolesAccordionRole }) {
  return (
    <div className={`${grantStyles.roleRow} ${grantStyles.roleRowSpaced}`}>
      <div className={grantStyles.roleLabelGroup}>
        <div className={grantStyles.roleLabel}>{role.label}</div>
      </div>
      <StatusBadge status={role.status} />
    </div>
  );
}

export function RolesAccordionPanel({
  title,
  roles,
  id,
  defaultOpen = false,
  headingLevel = "h2",
}: RolesAccordionPanelProps) {
  const titleContent = (
    <>
      {title}
      <span className={grantStyles.subgroupCount}> ({roles.length})</span>
    </>
  );

  return (
    <details id={id} className={grantStyles.accordionItem} open={defaultOpen || undefined}>
      <summary className={grantStyles.accordionSummary}>
        <span className={grantStyles.accordionIndicator} aria-hidden>
          <IconChevron />
        </span>
        {headingLevel === "h2" ? (
          <h2 className={grantStyles.accordionTitle}>{titleContent}</h2>
        ) : (
          <h3 className={grantStyles.accordionTitle}>{titleContent}</h3>
        )}
      </summary>
      <div className={grantStyles.accordionContent}>
        <div className={`${grantStyles.leafList} ${styles.readOnlyLeafList}`}>
          {roles.map((role, index) => (
            <ReadOnlyRoleRow key={`${role.label}-${index}`} role={role} />
          ))}
        </div>
      </div>
    </details>
  );
}

export function RolesAccordionList({ panels }: RolesAccordionListProps) {
  if (!panels.length) return null;

  return (
    <div className={grantStyles.accordionPanelShell}>
      {panels.map((panel, index) => (
        <RolesAccordionPanel
          key={panel.id}
          {...panel}
          headingLevel={index === 0 ? "h2" : "h3"}
        />
      ))}
    </div>
  );
}
