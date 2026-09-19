import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { Dashboard } from "@/pages/admin/Dashboard";
import { Clients } from "@/pages/admin/Clients";
import { Products } from "@/pages/admin/Products";
import { Categories } from "@/pages/admin/Categories";
import { Orders } from "@/pages/admin/Orders";
import { Discounts } from "@/pages/admin/Discounts";
import { Users } from "@/pages/admin/Users";
import { Settings } from "@/pages/admin/Settings";
import { PortalHome } from "@/pages/portal/PortalHome";
import { PortalCatalog } from "@/pages/portal/PortalCatalog";
import { PortalCart } from "@/pages/portal/PortalCart";
import { PortalOrders } from "@/pages/portal/PortalOrders";
import { PortalProfile } from "@/pages/portal/PortalProfile";

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--alloy-gray-500)" }}>
      {children}
    </div>
  );
}

export default function App() {
  const { session, appUser, loading } = useAuth();

  if (loading) return <FullScreenMessage>Se incarca...</FullScreenMessage>;

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (!appUser) {
    // Cont Supabase Auth existent, dar fara rand in app_users inca —
    // admin-ul trebuie sa-l asocieze din CRM (Utilizatori) intai.
    return (
      <FullScreenMessage>
        Contul tau nu e inca activat in platforma. Contacteaza administratorul Alloy.
      </FullScreenMessage>
    );
  }

  if (appUser.role === "admin") {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="clienti" element={<Clients />} />
          <Route path="produse" element={<Products />} />
          <Route path="categorii" element={<Categories />} />
          <Route path="comenzi" element={<Orders />} />
          <Route path="discounturi" element={<Discounts />} />
          <Route path="utilizatori" element={<Users />} />
          <Route path="setari" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<PortalHome />} />
        <Route path="categorii" element={<PortalCatalog />} />
        <Route path="cos" element={<PortalCart />} />
        <Route path="comenzi" element={<PortalOrders />} />
        <Route path="profil" element={<PortalProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );
}
