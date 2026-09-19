import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import type { ClientCategoryDiscount, Product, ProductCategory } from "@/lib/types";
import { clientPrice } from "@/lib/pricing";
import { Button, Card, Input } from "@/components/ui/primitives";

export function PortalHome() {
  const { appUser } = useAuth();
  const { add } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [discounts, setDiscounts] = useState<ClientCategoryDiscount[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      const [prod, cat, disc] = await Promise.all([
        supabase.from("products").select("*").eq("active", true).order("name"),
        supabase.from("product_categories").select("*").eq("active", true).order("name"),
        appUser?.company_id
          ? supabase.from("client_category_discounts").select("*").eq("company_id", appUser.company_id)
          : Promise.resolve({ data: [] as ClientCategoryDiscount[] }),
      ]);
      if (prod.data) setProducts(prod.data as Product[]);
      if (cat.data) setCategories(cat.data as ProductCategory[]);
      if (disc.data) setDiscounts(disc.data as ClientCategoryDiscount[]);
    }
    void load();
  }, [appUser?.company_id]);

  // Cautare simpla, client-side, pe numele deja incarcat (nume+SKU) — suficient
  // pentru volumul de Faza 1. Cautarea server-side tolerant la typo-uri (pg_trgm,
  // deja pregatit in schema) vine odata cu portalul complet, Faza 4.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [query, products]);

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Bun venit!</h1>
      <p style={{ color: "var(--alloy-gray-500)", marginBottom: 16, fontSize: 14 }}>
        Cauta produsul de care ai nevoie.
      </p>
      <Input
        placeholder="Cauta dupa denumire sau cod..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      {query.trim() ? (
        <div>
          {results.map((p) => {
            const { finalPrice, discountPercentage } = clientPrice(p, discounts);
            return (
              <Card key={p.id} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--alloy-gray-500)" }}>{p.sku}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "var(--alloy-red)" }}>
                      {finalPrice.toFixed(2)} € /{p.unit}
                    </div>
                    {discountPercentage > 0 && (
                      <div style={{ fontSize: 11, color: "var(--alloy-gray-500)", marginBottom: 4 }}>
                        -{discountPercentage}% fata de {p.base_price.toFixed(2)} €
                      </div>
                    )}
                    <Button
                      onClick={() =>
                        add({ productId: p.id, sku: p.sku, name: p.name, unit: p.unit, displayUnitPrice: finalPrice })
                      }
                    >
                      + Cos
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
          {results.length === 0 && (
            <div style={{ color: "var(--alloy-gray-500)", fontSize: 14 }}>Niciun rezultat.</div>
          )}
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: 14, textTransform: "uppercase", color: "var(--alloy-gray-500)", marginBottom: 8 }}>
            Categorii
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {categories.map((c) => (
              <Card key={c.id}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
