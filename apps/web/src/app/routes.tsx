import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { FinancialGridPage } from "../modules/financial-grid/components/FinancialGridPage";
import { AccountsPage } from "../pages/AccountsPage";
import { CategoriesPage } from "../pages/CategoriesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProfilePage } from "../pages/ProfilePage";
import { SettingsPage } from "../pages/SettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/login" element={null} />
        <Route path="/financial-grid" element={<FinancialGridPage />} />
        <Route path="/planilha-financeira" element={<FinancialGridPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/contas" element={<AccountsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/financial-grid" replace />} />
        <Route path="*" element={<Navigate to="/financial-grid" replace />} />
      </Route>
    </Routes>
  );
}
