import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Company } from "@/lib/types";
import { Button, Card, PageTitle } from "@/components/ui/primitives";

export function PortalProfile() {
  const { appUser, signOut } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    async function load() {
      if (!appUser?.company_id) return;
      const { data } = await supabase.from("companies").select("*").eq("id", appUser.company_id).single();
      if (data) setCompany(data as Company);
    }
    void load();
  }, [appUser?.company_id]);

  return (
    <div>
      <PageTitle>Profil</PageTitle>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{appUser?.name}</div>
        <div style={{ fontSize: 13, color: "var(--alloy-gray-500)" }}>{appUser?.email}</div>
      </Card>
      {company && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{company.company_name}</div>
          <div style={{ fontSize: 13, color: "var(--alloy-gray-500)" }}>CUI: {company.cui}</div>
        </Card>
      )}
      <Button variant="secondary" onClick={() => void signOut()}>
        Iesire
      </Button>
    </div>
  );
}
