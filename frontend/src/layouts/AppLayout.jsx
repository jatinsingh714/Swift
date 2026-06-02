import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "◇" },
  { to: "/products", label: "Products", icon: "▦" },
  { to: "/customers", label: "Customers", icon: "◉" },
  { to: "/orders", label: "Orders", icon: "↗" },
];

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <div>
            <strong>Swift</strong>
            <small>Operations Cloud</small>
          </div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">Production Console</span>
            <h1>Inventory & Orders</h1>
          </div>
          <span className="status-pill">
            <span aria-hidden="true" />
            API Ready
          </span>
        </header>
        <section className="content-area">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
