import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, PageTitle } from "@/components/ui/primitives";

interface Counts {
  companies: number;
  products: number;
  orders: number;
}

export function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    async function load() {
      const [companies, products, orders] = await Promise.all([
        supabase.from("companies").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        companies: companies.count ?? 0,
        products: products.count ?? 0,
        orders: orders.count ?? 0,
      });
    }
    void load();
  }, []);

  const stat = (label: string, value: number | undefined) => (
    <Card style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: "var(--alloy-gray-500)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value ?? "—"}</div>
    </Card>
  );

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {stat("Clienti activi", counts?.companies)}
        {stat("Produse active", counts?.products)}
        {stat("Comenzi", counts?.orders)}
      </div>
    </div>
  );
}
