import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "../modules/financial-grid/components/AppSidebar";
import { LoginPanel } from "../modules/financial-grid/components/LoginPanel";
import { ThemeToggle } from "../modules/financial-grid/components/ThemeToggle";
import { useSession } from "../modules/financial-grid/hooks/useSession";
import { useTheme } from "../modules/financial-grid/hooks/useTheme";

export function AppLayout() {
  const session = useSession();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  function handleSignOut() {
    session.signOut();
    navigate("/login", { replace: true });
  }

  if (location.pathname === "/login") {
    if (session.isAuthenticated) {
      return <Navigate to="/financial-grid" replace />;
    }

    return (
      <main className="app-shell app-shell--auth">
        <div className="auth-theme">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <section className="auth-stage">
          <LoginPanel
            error={session.error}
            loading={session.loading}
            onRegister={session.signUp}
            onSubmit={session.signIn}
            success={session.success}
          />
        </section>
      </main>
    );
  }

  if (!session.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <main className="app-shell app-shell--workspace">
      <AppSidebar user={session.user} onSignOut={handleSignOut} />
      <section className="workspace-main">
        <Outlet context={{ theme, toggleTheme }} />
      </section>
    </main>
  );
}
