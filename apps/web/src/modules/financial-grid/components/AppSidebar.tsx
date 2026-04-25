import { NavLink, useLocation } from "react-router-dom";
import type { LoginResponse } from "../types/financialGrid.types";

type AppSidebarProps = {
  user: LoginResponse["user"] | null;
  onSignOut: () => void;
};

const menuItems = [
  {
    label: "Planilha financeira",
    path: "/financial-grid",
    aliases: ["/planilha-financeira"],
  },
  { label: "Dashboard", path: "/dashboard", aliases: [] },
  { label: "Contas", path: "/accounts", aliases: ["/contas"] },
  { label: "Categorias", path: "/categories", aliases: ["/categorias"] },
  { label: "Perfil", path: "/profile", aliases: ["/perfil"] },
  { label: "Configurações", path: "/settings", aliases: ["/configuracoes"] },
];

export function AppSidebar({ user, onSignOut }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <div>
          <strong>ORDINIS</strong>
          <small>Finance OS</small>
        </div>
      </div>

      <section className="sidebar__profile">
        <div className="avatar" aria-hidden="true">
          {(user?.fullName ?? "U").slice(0, 1)}
        </div>
        <strong>{user?.fullName ?? "Usuario Demo Ordinis"}</strong>
        <span>{user?.email ?? "Usuario Demo Ordinis"}</span>
      </section>

      <nav className="sidebar__nav" aria-label="Menu principal">
        {menuItems.map((item) => (
          <NavLink
            className={() => {
              const isActive =
                location.pathname === item.path ||
                item.aliases.includes(location.pathname);

              return `sidebar__nav-item ${isActive ? "is-active" : ""}`;
            }}
            key={item.path}
            to={item.path}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar__signout" onClick={onSignOut} type="button">
        Sair
      </button>
    </aside>
  );
}
