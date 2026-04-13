import { Link } from "react-router-dom";
import { ExtendRolesDialog } from "../components/ExtendRolesDialog";
import styles from "./ExtendRolesPage.module.css";

export function ExtendRolesPage() {
  return (
    <div className={styles.wrap}>
      <Link className={styles.back} to="/">
        ← Back to users
      </Link>
      <ExtendRolesDialog />
    </div>
  );
}
