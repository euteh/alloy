import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { generateOrderPdf } from "@/lib/orderPdf";
import { Button, Card, PageTitle } from "@/components/ui/primitives";

export function PortalCart() {
  const { lines, updateQuantity, remove, clear } = useCart();
  const { appUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Doar informativ — totalul REAL vine din baza de date dupa generare
  // (functia create_order recalculeaza pret+discount server-side).
  const estimatedTotal = lines.reduce((sum, l) => sum + l.displayUnitPrice * l.quantity, 0);

  async function handleGenerate() {
    setSubmitting(true);
    setError(null);
    try {
      const { data: orderId, error: rpcError } = await supabase.rpc("create_order", {
        p_items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
      });
      if (rpcError) throw rpcError;

      const { data: order } = await supabase.from("orders").select("order_number").eq("id", orderId as string).single();
      setOrderNumber(order?.order_number ?? null);
      setSuccessOrderId(orderId as string);
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la generarea comenzii");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadPdf() {
    if (!successOrderId) return;
    const doc = await generateOrderPdf(successOrderId);
    doc.save(`${orderNumber ?? "comanda"}.pdf`);
  }

  function handleEmail() {
    if (!successOrderId || !orderNumber) return;
    const subject = encodeURIComponent(`Comanda ${orderNumber} — Alloy B2B`);
    const body = encodeURIComponent(
      `Buna,\n\nAtasat gasiti comanda ${orderNumber}.\n\n(Descarcati intai PDF-ul cu butonul de mai sus si atasati-l manual — trimiterea automata a atasamentului e Faza 6, netestata inca.)`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  if (successOrderId) {
    return (
      <div>
        <PageTitle>Comanda generata</PageTitle>
        <Card>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Comanda a fost generata cu succes!</div>
          <div style={{ color: "var(--alloy-gray-500)", marginBottom: 16 }}>Nr. comanda: {orderNumber}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button onClick={() => void handleDownloadPdf()}>Descarca PDF</Button>
            <Button variant="secondary" onClick={handleEmail}>
              Trimite pe e-mail
            </Button>
            <Link to="/portal/comenzi">
              <Button variant="ghost">Vezi comenzile mele</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageTitle>Cosul meu</PageTitle>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      {lines.length === 0 ? (
        <Card>
          <p style={{ color: "var(--alloy-gray-500)", fontSize: 14 }}>
            Cosul e gol. Adauga produse din <Link to="/portal">Acasa</Link> sau{" "}
            <Link to="/portal/categorii">Catalog</Link>.
          </p>
        </Card>
      ) : (
        <>
          {lines.map((l) => (
            <Card key={l.productId} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: "var(--alloy-gray-500)" }}>{l.sku}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Button variant="secondary" onClick={() => updateQuantity(l.productId, l.quantity - 1)}>
                    −
                  </Button>
                  <span style={{ minWidth: 30, textAlign: "center" }}>
                    {l.quantity} {l.unit}
                  </span>
                  <Button variant="secondary" onClick={() => updateQuantity(l.productId, l.quantity + 1)}>
                    +
                  </Button>
                  <div style={{ minWidth: 80, textAlign: "right", fontWeight: 600 }}>
                    {(l.displayUnitPrice * l.quantity).toFixed(2)} €
                  </div>
                  <Button variant="ghost" onClick={() => remove(l.productId)}>
                    Sterge
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 700 }}>Total estimat (fara TVA)</span>
              <span style={{ fontWeight: 700 }}>{estimatedTotal.toFixed(2)} €</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--alloy-gray-500)", marginBottom: 12 }}>
              Valorile finale (pret, discount) se recalculeaza in baza de date la generarea comenzii —
              cele de mai sus sunt orientative.
            </div>
            <Button
              style={{ width: "100%" }}
              disabled={submitting || !appUser?.company_id}
              onClick={() => void handleGenerate()}
            >
              {submitting ? "Se genereaza..." : "Genereaza comanda (PDF)"}
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
