import styles from "./Toast.module.css";

export type ToastProps = {
  message: string | null;
  onDismiss: () => void;
};

function IconInfo() {
  return (
    <svg
      className={styles.infoIcon}
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <circle cx="10" cy="10" r="10" fill="#1961AE" />
      <text
        x="10"
        y="14"
        textAnchor="middle"
        fill="#ffffff"
        className={styles.infoLetter}
      >
        i
      </text>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M12 4L4 12M4 4l8 8"
        stroke="#666666"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-atomic="true">
      <div className={styles.surface}>
        <IconInfo />
        <p className={styles.text}>{message}</p>
        <button
          type="button"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <IconClose />
        </button>
      </div>
    </div>
  );
}
