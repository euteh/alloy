import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product, ProductCategory } from "@/lib/types";
import { Badge, Button, Card, Input, PageTitle, Select, Table, Td, Th } from "@/components/ui/primitives";

const EMPTY = {
  sku: "",
  name: "",
  category_id: "",
  base_price: "",
  unit: "buc" as Product["unit"],
  technical_sheet_url: "",
};

export function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [prod, cat] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("product_categories").select("*").order("name"),
    ]);
    if (prod.error) setError(prod.error.message);
    else setItems(prod.data as Product[]);
    if (cat.data) setCategories(cat.data as ProductCategory[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function categoryName(id: string | null) {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  async function addProduct() {
    if (!form.sku.trim() || !form.name.trim() || !form.base_price) return;
    const { error } = await supabase.from("products").insert({
      sku: form.sku.trim(),
      name: form.name.trim(),
      category_id: form.category_id || null,
      base_price: Number(form.base_price),
      unit: form.unit,
      technical_sheet_url: form.technical_sheet_url || null,
    });
    if (error) setError(error.message);
    else {
      setForm(EMPTY);
      void load();
    }
  }

  async function toggleActive(p: Product) {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    void load();
  }

  return (
    <div>
      <PageTitle>Produse</PageTitle>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <Input placeholder="Nume" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">Fara categorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Pret baza"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
          />
          <Select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value as Product["unit"] })}
          >
            <option value="buc">buc</option>
            <option value="kg">kg</option>
            <option value="set">set</option>
            <option value="ml">ml</option>
          </Select>
          <Input
            placeholder="Fisa tehnica (URL)"
            value={form.technical_sheet_url}
            onChange={(e) => setForm({ ...form, technical_sheet_url: e.target.value })}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <Button onClick={() => void addProduct()}>Adauga produs</Button>
        </div>
      </Card>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>SKU</Th>
              <Th>Nume</Th>
              <Th>Categorie</Th>
              <Th>Pret</Th>
              <Th>UM</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <Td>{p.sku}</Td>
                <Td>{p.name}</Td>
                <Td>{categoryName(p.category_id)}</Td>
                <Td>{p.base_price.toFixed(2)} €</Td>
                <Td>{p.unit}</Td>
                <Td>
                  <Badge tone={p.active ? "green" : "gray"}>{p.active ? "Activ" : "Inactiv"}</Badge>
                </Td>
                <Td>
                  <Button variant="ghost" onClick={() => void toggleActive(p)}>
                    {p.active ? "Dezactiveaza" : "Activeaza"}
                  </Button>
                </Td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <Td>Niciun produs inca.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
