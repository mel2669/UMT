import { Navigate, Route, Routes } from "react-router-dom";
import { ExtendRolesPage } from "./pages/ExtendRolesPage";
import { RowActionExtendPage } from "./pages/RowActionExtendPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RowActionExtendPage />} />
      <Route path="/extend-roles" element={<ExtendRolesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
