import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ClientCategoryDiscount, Company, ProductCategory } from "@/lib/types";
import { Button, Card, Input, PageTitle, Select, Table, Td, Th } from "@/components/ui/primitives";

export function Discounts() {
  const [items, setItems] = useState<ClientCategoryDiscount[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [disc, comps, cats] = await Promise.all([
      supabase.from("client_category_discounts").select("*"),
      supabase.from("companies").select("*").order("company_name"),
      supabase.from("product_categories").select("*").order("name"),
    ]);
    if (disc.error) setError(disc.error.message);
    else setItems(disc.data as ClientCategoryDiscount[]);
    if (comps.data) setCompanies(comps.data as Company[]);
    if (cats.data) setCategories(cats.data as ProductCategory[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function companyName(id: string) {
    return companies.find((c) => c.id === id)?.company_name ?? "—";
  }
  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  async function saveDiscount() {
    if (!companyId || !categoryId || !percentage) return;
    // Un rand per (companie, categorie) — upsert pe unique constraint din schema.
    const { error } = await supabase
      .from("client_category_discounts")
      .upsert(
        { company_id: companyId, category_id: categoryId, discount_percentage: Number(percentage), updated_at: new Date().toISOString() },
        { onConflict: "company_id,category_id" },
      );
    if (error) setError(error.message);
    else {
      setPercentage("");
      void load();
    }
  }

  return (
    <div>
      <PageTitle>Discounturi</PageTitle>
      <div style={{ fontSize: 12, color: "var(--alloy-gray-500)", marginBottom: 12 }}>
        Lipsa unui rand pentru o combinatie companie+categorie inseamna discount 0%.
      </div>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
          <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">Alege compania</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </Select>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Alege categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={100}
            placeholder="Procent discount"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <Button onClick={() => void saveDiscount()}>Salveaza discount</Button>
        </div>
      </Card>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Companie</Th>
              <Th>Categorie</Th>
              <Th>Discount</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <tr key={d.id}>
                <Td>{companyName(d.company_id)}</Td>
                <Td>{categoryName(d.category_id)}</Td>
                <Td>{d.discount_percentage}%</Td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <Td>Niciun discount configurat inca.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
