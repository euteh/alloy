import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { ClientCategoryDiscount, Product, ProductCategory } from "@/lib/types";
import { clientPrice } from "@/lib/pricing";
import { Card, PageTitle, Select } from "@/components/ui/primitives";

export function PortalCatalog() {
  const { appUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [discounts, setDiscounts] = useState<ClientCategoryDiscount[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");

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

  const visible = categoryFilter ? products.filter((p) => p.category_id === categoryFilter) : products;

  return (
    <div>
      <PageTitle>Catalog produse</PageTitle>
      <div style={{ marginBottom: 16, maxWidth: 260 }}>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Toate categoriile</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      {visible.map((p) => {
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
                  <div style={{ fontSize: 11, color: "var(--alloy-gray-500)" }}>-{discountPercentage}%</div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
      {visible.length === 0 && (
        <div style={{ color: "var(--alloy-gray-500)", fontSize: 14 }}>Niciun produs.</div>
      )}
    </div>
  );
}
