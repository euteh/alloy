import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/lib/types";
import { Badge, Card, PageTitle, Table, Td, Th } from "@/components/ui/primitives";

export function PortalOrders() {
  const { appUser } = useAuth();
  const [items, setItems] = useState<Order[]>([]);

  useEffect(() => {
    async function load() {
      if (!appUser?.company_id) return;
      // RLS filtreaza deja pe compania utilizatorului — filtrul explicit e
      // doar pentru claritatea query-ului, nu e mecanismul de securitate.
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("company_id", appUser.company_id)
        .order("created_at", { ascending: false });
      if (data) setItems(data as Order[]);
    }
    void load();
  }, [appUser?.company_id]);

  return (
    <div>
      <PageTitle>Comenzile mele</PageTitle>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Nr. comanda</Th>
              <Th>Status</Th>
              <Th>Total</Th>
              <Th>Data</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <Td>{o.order_number}</Td>
                <Td>
                  <Badge>{o.status}</Badge>
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
