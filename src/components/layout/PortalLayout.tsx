import { NavLink, Outlet } from "react-router-dom";
import { Home, Grid3x3, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { to: "/portal", label: "Acasa", end: true, icon: Home },
  { to: "/portal/categorii", label: "Categorii", icon: Grid3x3 },
  { to: "/portal/cos", label: "Cos", icon: ShoppingCart },
  { to: "/portal/comenzi", label: "Comenzi", icon: ClipboardList },
  { to: "/portal/profil", label: "Profil", icon: User },
];

export function PortalLayout() {
  const { lines } = useCart();
  const { appUser } = useAuth();
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--alloy-gray-100)" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "#fff",
          borderBottom: "1px solid var(--alloy-gray-200)",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, color: "var(--alloy-red)" }}>
          ALLOY <span style={{ color: "var(--alloy-gray-700)" }}>B2B</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{appUser?.name ?? "..."}</div>
          <div style={{ fontSize: 10, color: "var(--alloy-gray-500)" }}>Portal client</div>
        </div>
      </header>
      <main style={{ flex: 1, padding: 16, paddingBottom: 84 }}>
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
          padding: "8px 0 10px",
          boxShadow: "0 -1px 4px rgba(15, 23, 42, 0.05)",
        }}
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                fontWeight: 600,
                textDecoration: "none",
                color: isActive ? "var(--alloy-red)" : "var(--alloy-gray-500)",
                position: "relative",
                minWidth: 52,
              })}
            >
              <Icon size={20} />
              {item.label}
              {item.to === "/portal/cos" && itemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: 6,
                    background: "var(--alloy-red)",
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 5px",
                    lineHeight: "12px",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
