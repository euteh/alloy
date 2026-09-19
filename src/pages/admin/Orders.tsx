import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Company, Order } from "@/lib/types";
import { Badge, Card, PageTitle, Table, Td, Th } from "@/components/ui/primitives";

/**
 * Faza 1: doar lista comenzilor existente (schema + date demo). Fluxul de
 * creare a unei comenzi (cos -> validare -> PDF -> email) e Faza 5, nu aici.
 */
export function Orders() {
  const [items, setItems] = useState<Order[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [ord, comp] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("companies").select("*"),
      ]);
      if (ord.error) setError(ord.error.message);
      else setItems(ord.data as Order[]);
      if (comp.data) setCompanies(comp.data as Company[]);
    }
    void load();
  }, []);

  function companyName(id: string) {
    return companies.find((c) => c.id === id)?.company_name ?? "—";
  }

  const statusTone: Record<Order["status"], "gray" | "green" | "amber" | "red"> = {
    draft: "gray",
    submitted: "amber",
    confirmed: "green",
    cancelled: "red",
  };

  return (
    <div>
      <PageTitle>Comenzi</PageTitle>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Nr. comanda</Th>
              <Th>Companie</Th>
              <Th>Status</Th>
              <Th>Total</Th>
              <Th>Data</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <Td>{o.order_number}</Td>
                <Td>{companyName(o.company_id)}</Td>
                <Td>
                  <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                </Td>
                <Td>{o.total.toFixed(2)} €</Td>
                <Td>{new Date(o.created_at).toLocaleDateString("ro-RO")}</Td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <Td>Nicio comanda inca.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
