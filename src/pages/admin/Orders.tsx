import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Company, Order, OrderItem, Product } from "@/lib/types";
import { Badge, Button, Card, PageTitle, Table, Td, Th } from "@/components/ui/primitives";

/**
 * Comenzile create din Portal B2B intra cu status "submitted" (vezi
 * create_order in migratia 0002) — admin-ul le vede aici, le deschide ca sa
 * verifice liniile, si le valideaza (-> "confirmed") sau le respinge
 * (-> "cancelled"). Update-ul de status merge direct din client pe RLS-ul
 * "orders_admin_all" (admin are for all), fara alt RPC.
 */
export function Orders() {
  const [items, setItems] = useState<Order[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [ord, comp, prod] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("companies").select("*"),
      supabase.from("products").select("*"),
    ]);
    if (ord.error) setError(ord.error.message);
    else setItems(ord.data as Order[]);
    if (comp.data) setCompanies(comp.data as Company[]);
    if (prod.data) setProducts(prod.data as Product[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function companyName(id: string) {
    return companies.find((c) => c.id === id)?.company_name ?? "—";
  }

  function productName(id: string) {
    const p = products.find((p) => p.id === id);
    return p ? `${p.sku} — ${p.name}` : id;
  }

  async function toggleExpand(orderId: string) {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    if (!orderItems[orderId]) {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (data) setOrderItems((prev) => ({ ...prev, [orderId]: data as OrderItem[] }));
    }
  }

  async function setStatus(orderId: string, status: Order["status"]) {
    setBusy(orderId);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    setBusy(null);
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  const statusTone: Record<Order["status"], "gray" | "green" | "amber" | "red"> = {
    draft: "gray",
    submitted: "amber",
    confirmed: "green",
    cancelled: "red",
  };

  const statusLabel: Record<Order["status"], string> = {
    draft: "ciorna",
    submitted: "de validat",
    confirmed: "validata",
    cancelled: "anulata",
  };

  return (
    <div>
      <PageTitle>Comenzi</PageTitle>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      <Card>
        <Table>
          <thead>
            <tr>
              <Th></Th>
              <Th>Nr. comanda</Th>
              <Th>Companie</Th>
              <Th>Status</Th>
              <Th>Total</Th>
              <Th>Data</Th>
              <Th>Actiuni</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <>
                <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => void toggleExpand(o.id)}>
                  <Td>{expanded === o.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</Td>
                  <Td>{o.order_number}</Td>
                  <Td>{companyName(o.company_id)}</Td>
                  <Td>
                    <Badge tone={statusTone[o.status]}>{statusLabel[o.status]}</Badge>
                  </Td>
                  <Td>{o.total.toFixed(2)} €</Td>
                  <Td>{new Date(o.created_at).toLocaleDateString("ro-RO")}</Td>
                  <Td>
                    {o.status === "submitted" && (
                      <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="primary"
                          disabled={busy === o.id}
                          onClick={() => void setStatus(o.id, "confirmed")}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Check size={14} /> Valideaza
                          </span>
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={busy === o.id}
                          onClick={() => void setStatus(o.id, "cancelled")}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <X size={14} /> Respinge
                          </span>
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
                {expanded === o.id && (
                  <tr key={`${o.id}-detail`}>
                    <Td>{null}</Td>
                    <td colSpan={6} style={{ padding: "0 12px 14px", borderBottom: "1px solid var(--alloy-gray-100)" }}>
                      {!orderItems[o.id] ? (
                        <div style={{ color: "var(--alloy-gray-500)", fontSize: 13 }}>Se incarca...</div>
                      ) : (
                        <Table>
                          <thead>
                            <tr>
                              <Th>Produs</Th>
                              <Th>Cant.</Th>
                              <Th>Pret unitar</Th>
                              <Th>Discount</Th>
                              <Th>Total linie</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderItems[o.id].map((li) => (
                              <tr key={li.id}>
                                <Td>{productName(li.product_id)}</Td>
                                <Td>{li.quantity}</Td>
                                <Td>{li.final_unit_price.toFixed(2)} €</Td>
                                <Td>{li.discount_percentage}%</Td>
                                <Td>{li.line_total.toFixed(2)} €</Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
            {items.length === 0 && (
              <tr>
                <Td>{null}</Td>
                <Td>Nicio comanda inca.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
