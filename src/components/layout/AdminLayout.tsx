import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/primitives";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/clienti", label: "Clienti" },
  { to: "/admin/produse", label: "Produse" },
  { to: "/admin/categorii", label: "Categorii" },
  { to: "/admin/comenzi", label: "Comenzi" },
  { to: "/admin/discounturi", label: "Discounturi" },
  { to: "/admin/utilizatori", label: "Utilizatori" },
  { to: "/admin/setari", label: "Setari" },
];

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: "block",
  padding: "9px 14px",
  borderRadius: 8,
  color: active ? "#fff" : "var(--alloy-gray-700)",
  background: active ? "var(--alloy-red)" : "transparent",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 2,
});

export function AdminLayout() {
  const { appUser, signOut } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--alloy-gray-200)",
          background: "#fff",
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, color: "var(--alloy-red)", marginBottom: 20 }}>
          ALLOY B2B
        </div>
        <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--alloy-gray-500)", marginBottom: 6 }}>
          CRM Intern
        </div>
        <nav>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => linkStyle(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderBottom: "1px solid var(--alloy-gray-200)",
            background: "#fff",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{appUser?.name ?? "..."}</div>
            <div style={{ fontSize: 11, color: "var(--alloy-gray-500)" }}>Administrator</div>
          </div>
          <Button variant="secondary" onClick={() => void signOut()}>
            Iesire
          </Button>
        </header>
        <main style={{ flex: 1, padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
