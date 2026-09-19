import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  Tags,
  ShoppingCart,
  Percent,
  UserCog,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/primitives";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true, icon: LayoutDashboard },
  { to: "/admin/clienti", label: "Clienti", icon: Users },
  { to: "/admin/produse", label: "Produse", icon: Package },
  { to: "/admin/categorii", label: "Categorii", icon: Tags },
  { to: "/admin/comenzi", label: "Comenzi", icon: ShoppingCart },
  { to: "/admin/discounturi", label: "Discounturi", icon: Percent },
  { to: "/admin/utilizatori", label: "Utilizatori", icon: UserCog },
  { to: "/admin/setari", label: "Setari", icon: SettingsIcon },
];

const linkStyle = (active: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "9px 14px",
  borderRadius: 8,
  color: active ? "#fff" : "var(--alloy-gray-700)",
  background: active ? "var(--alloy-red)" : "transparent",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 2,
  transition: "background 120ms ease",
});

export function AdminLayout() {
  const { appUser, signOut } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 232,
          flexShrink: 0,
          borderRight: "1px solid var(--alloy-gray-200)",
          background: "#fff",
          padding: 20,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 17, color: "var(--alloy-red)", marginBottom: 24 }}>
          ALLOY <span style={{ color: "var(--alloy-gray-700)" }}>B2B</span>
        </div>
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            color: "var(--alloy-gray-500)",
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          CRM Intern
        </div>
        <nav>
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} style={({ isActive }) => linkStyle(isActive)}>
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
            padding: "14px 28px",
            borderBottom: "1px solid var(--alloy-gray-200)",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{appUser?.name ?? "..."}</div>
            <div style={{ fontSize: 11, color: "var(--alloy-gray-500)" }}>Administrator</div>
          </div>
          <Button variant="secondary" onClick={() => void signOut()}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LogOut size={14} /> Iesire
            </span>
          </Button>
        </header>
        <main style={{ flex: 1, padding: 28, background: "var(--alloy-gray-100)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
