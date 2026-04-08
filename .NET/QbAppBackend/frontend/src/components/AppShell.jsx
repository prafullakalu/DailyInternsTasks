import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../auth";
import { moduleLinks } from "../constants/navigation";

export function AppShell({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    clearToken();
    navigate("/signin");
  }

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">QB</div>
          {!collapsed && <div>
            <p className="eyebrow">LedgerFlow</p>
            <h1>Operations</h1>
          </div>}
          <button type="button" className="collapse-button" onClick={() => setCollapsed((value) => !value)}>
            {collapsed ? ">" : "<"}
          </button>
        </div>
        <div className="sidebar-sections">
          <div className="sidebar-group">
            {!collapsed && <p className="sidebar-group-label">Modules</p>}
            <nav className="nav-list">
              {moduleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  {collapsed ? (
                    <span className="nav-link-label collapsed">{link.shortLabel}</span>
                  ) : (
                    <span className="nav-link-label">{link.label}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        <div className="sidebar-footer">
          <button className="ghost-button" onClick={handleLogout}>
            {collapsed ? "Out" : "Sign Out"}
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
