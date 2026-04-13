import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ColumnMultiSelectFilter.module.css";

export type ColumnMultiSelectOption = {
  value: string;
  label: string;
};

export type ColumnMultiSelectFilterProps = {
  id: string;
  options: ColumnMultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  "aria-label": string;
};

function IconChevron() {
  return (
    <svg
      className={styles.chevron}
      width={16}
      height={16}
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

const MAX_CHIPS = 2;

export function ColumnMultiSelectFilter({
  id,
  options,
  selected,
  onChange,
  isOpen,
  onOpenChange,
  "aria-label": ariaLabel,
}: ColumnMultiSelectFilterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const listboxId = `${id}-listbox`;
  const [draftSelected, setDraftSelected] = useState<string[]>([]);

  const labelByValue = useMemo(
    () => Object.fromEntries(options.map((o) => [o.value, o.label])),
    [options],
  );

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setDraftSelected([...selected]);
    }
    wasOpen.current = isOpen;
  }, [isOpen, selected]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onOpenChange]);

  function toggleDraft(value: string) {
    setDraftSelected((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  }

  function apply() {
    onChange(draftSelected);
    onOpenChange(false);
  }

  function reset() {
    setDraftSelected([]);
    onChange([]);
    onOpenChange(false);
  }

  function removeValue(value: string) {
    onChange(selected.filter((x) => x !== value));
  }

  function clearAll() {
    onChange([]);
  }

  const overflow = selected.length > MAX_CHIPS ? selected.length - MAX_CHIPS : 0;
  const visibleValues =
    overflow > 0 ? selected.slice(0, MAX_CHIPS) : selected;

  return (
    <div ref={rootRef} className={styles.root}>
      <div
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""}`}
      >
        <div
          className={styles.chipsColumn}
          onClick={() => onOpenChange(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpenChange(!isOpen);
            }
          }}
          tabIndex={0}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
        >
          {selected.length === 0 && (
            <span className={styles.placeholder}>Filter</span>
          )}
          {visibleValues.map((v) => (
            <span
              key={v}
              className={styles.chip}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.chipRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  removeValue(v);
                }}
                aria-label={`Remove ${labelByValue[v] ?? v}`}
              >
                ×
              </button>
              <span className={styles.chipLabel}>{labelByValue[v] ?? v}</span>
            </span>
          ))}
          {overflow > 0 && (
            <span className={`${styles.chip} ${styles.chipMore}`}>
              <span className={styles.chipLabel}>+{overflow} more</span>
            </span>
          )}
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            className={styles.clearAll}
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
            aria-label="Clear all filters"
          >
            ×
          </button>
        )}
        <button
          type="button"
          className={styles.chevronBtn}
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(!isOpen);
          }}
          aria-label={isOpen ? "Close filter menu" : "Open filter menu"}
        >
          <span className={isOpen ? styles.chevronUp : undefined}>
            <IconChevron />
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          id={listboxId}
          className={styles.panel}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className={styles.panelBody}
            role="listbox"
            aria-multiselectable="true"
            aria-label={`${ariaLabel} options`}
          >
            {options.map((opt) => (
              <label key={opt.value} className={styles.option}>
                <input
                  type="checkbox"
                  checked={draftSelected.includes(opt.value)}
                  onChange={() => toggleDraft(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          <div className={styles.panelFooter}>
            <button
              type="button"
              className={styles.btnReset}
              onClick={reset}
            >
              Reset
            </button>
            <button
              type="button"
              className={styles.btnApply}
              onClick={apply}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
