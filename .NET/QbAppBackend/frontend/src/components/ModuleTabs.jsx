import { NavLink } from "react-router-dom";

export function ModuleTabs({ links }) {
  return (
    <div className="module-tabs">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `module-tab ${isActive ? "active" : ""}`}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}
