import { NavLink, Outlet } from "react-router-dom";

const NAV = [
  { to: "/portal", label: "Acasa", end: true },
  { to: "/portal/categorii", label: "Categorii" },
  { to: "/portal/cos", label: "Cos" },
  { to: "/portal/comenzi", label: "Comenzi" },
  { to: "/portal/profil", label: "Profil" },
];

export function PortalLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          padding: "14px 16px",
          background: "#fff",
          borderBottom: "1px solid var(--alloy-gray-200)",
          fontWeight: 800,
          color: "var(--alloy-red)",
        }}
      >
        ALLOY B2B
      </header>
      <main style={{ flex: 1, padding: 16, paddingBottom: 76 }}>
        <Outlet />
      </main>
      {/* Bottom bar — mobil-first, per DESIGN_REFERENCE.md. Ramane vizibil si pe
          desktop pentru simplitate in Faza 1 (nu exista inca un sidebar alternativ
          pentru portal pe desktop). */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          background: "#fff",
          borderTop: "1px solid var(--alloy-gray-200)",
          padding: "8px 0",
        }}
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "var(--alloy-red)" : "var(--alloy-gray-500)",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
