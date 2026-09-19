import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "./supabase";

/**
 * Genereaza PDF-ul unei comenzi deja create (client-side, jsPDF — suficient
 * pentru demo; un sablon mai elaborat / brand complet e Faza 6).
 */
export async function generateOrderPdf(orderId: string): Promise<jsPDF> {
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("*, companies(company_name, cui, address, city)")
    .eq("id", orderId)
    .single();
  if (orderErr || !order) throw new Error(orderErr?.message ?? "Comanda nu a fost gasita");

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("*, products(sku, name)")
    .eq("order_id", orderId);
  if (itemsErr) throw new Error(itemsErr.message);

  const company = order.companies as unknown as {
    company_name: string;
    cui: string;
    address: string | null;
    city: string | null;
  };

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(220, 38, 38); // #DC2626
  doc.text("ALLOY B2B", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(`Comanda ${order.order_number}`, 14, 28);
  doc.text(`Data: ${new Date(order.created_at).toLocaleDateString("ro-RO")}`, 14, 34);
  doc.text(`Client: ${company.company_name} (CUI ${company.cui})`, 14, 40);
  if (company.address || company.city) {
    doc.text(`${company.address ?? ""} ${company.city ?? ""}`.trim(), 14, 46);
  }

  const rows = (
    items as unknown as {
      quantity: number;
      final_unit_price: number;
      discount_percentage: number;
      line_total: number;
      products: { sku: string; name: string };
    }[]
  ).map((it) => [
    it.products.sku,
    it.products.name,
    String(it.quantity),
    `${it.final_unit_price.toFixed(2)} €`,
    `${it.discount_percentage}%`,
    `${it.line_total.toFixed(2)} €`,
  ]);

  autoTable(doc, {
    startY: 54,
    head: [["SKU", "Produs", "Cant.", "Pret unitar", "Discount", "Total linie"]],
    body: rows,
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 9 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 60;
  doc.setFontSize(10);
  doc.text(`Subtotal: ${order.subtotal.toFixed(2)} €`, 140, finalY + 10);
  doc.text(`Discount: -${order.discount_total.toFixed(2)} €`, 140, finalY + 16);
  doc.setFontSize(12);
  doc.text(`Total (fara TVA): ${order.total.toFixed(2)} €`, 140, finalY + 24);

  return doc;
}
