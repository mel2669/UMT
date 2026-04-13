import { useLayoutEffect, useMemo, useRef } from "react";
import dialogStyles from "./ExtendRolesDialog.module.css";
import styles from "./ScopeRolesDetail.module.css";

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={14}
      height={14}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M7 4l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type ScopeRolesSummaryCardProps = {
  roleNames: readonly string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Merged onto the scope `<article>` (e.g. summaryCard + impact). */
  articleClassName: string;
  /** Optional extra class on the accent bar. */
  cardAccentClassName?: string;
  /** Optional kicker class (e.g. impact uppercase style). */
  kickerClassName?: string;
  /** Distinct role count shown on the card. */
  distinctCount: number;
  /** Optional id prefix for aria ids. */
  idPrefix?: string;
};

export function ScopeRolesSummaryCard({
  roleNames,
  open,
  onOpenChange,
  articleClassName,
  cardAccentClassName = dialogStyles.cardAccent,
  kickerClassName = "",
  distinctCount,
  idPrefix = "scope-roles",
}: ScopeRolesSummaryCardProps) {
  const hideBtnRef = useRef<HTMLButtonElement>(null);
  const sortedRoles = useMemo(
    () => [...new Set(roleNames)].sort((a, b) => a.localeCompare(b)),
    [roleNames],
  );

  const titleId = `${idPrefix}-title`;
  const listId = `${idPrefix}-list`;

  useLayoutEffect(() => {
    if (open) hideBtnRef.current?.focus();
  }, [open]);

  return (
    <>
      <article
        className={`${articleClassName} ${styles.scopeArticle}`}
        data-scope-card
      >
        <div className={cardAccentClassName} />
        <button
          type="button"
          className={styles.scopeHit}
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => onOpenChange(!open)}
        >
          <div className={dialogStyles.cardBody}>
            <p
              className={
                kickerClassName
                  ? `${dialogStyles.cardKicker} ${kickerClassName}`
                  : dialogStyles.cardKicker
              }
            >
              Scope
            </p>
            <p className={dialogStyles.cardNumber}>{distinctCount}</p>
            <p className={dialogStyles.cardSub}>Distinct roles</p>
            <span
              className={`${styles.scopeHint} ${open ? styles.scopeHintOpen : ""}`}
            >
              View affected roles
              <IconChevronRight className={styles.chevron} />
            </span>
          </div>
        </button>
      </article>

      {open && (
        <div className={styles.inlineExpand}>
          <section
            className={styles.inlinePanel}
            role="region"
            aria-labelledby={titleId}
          >
            <div className={styles.inlineHeader}>
              <h2 className={styles.inlineTitle} id={titleId}>
                Affected roles
              </h2>
              <button
                ref={hideBtnRef}
                type="button"
                className={styles.hideBtn}
                onClick={() => onOpenChange(false)}
              >
                Hide
              </button>
            </div>
            {sortedRoles.length === 0 ? (
              <p className={styles.empty} id={listId}>
                No roles in this scope.
              </p>
            ) : (
              <div className={styles.listWrap}>
                <ul className={styles.roleList} id={listId}>
                  {sortedRoles.map((name) => (
                    <li key={name} className={styles.roleLine}>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
