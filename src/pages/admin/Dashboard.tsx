import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PageTitle, StatCard } from "@/components/ui/primitives";

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

  return (
    <div>
      <PageTitle>Dashboard</PageTitle>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard icon={<Users size={20} />} label="Clienti activi" value={counts?.companies ?? "—"} tone="red" />
        <StatCard icon={<Package size={20} />} label="Produse active" value={counts?.products ?? "—"} tone="blue" />
        <StatCard icon={<ShoppingCart size={20} />} label="Comenzi" value={counts?.orders ?? "—"} tone="green" />
      </div>
    </div>
  );
}
