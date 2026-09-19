import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ProductCategory } from "@/lib/types";
import { Badge, Button, Card, Input, PageTitle, Table, Td, Th } from "@/components/ui/primitives";

export function Categories() {
  const [items, setItems] = useState<ProductCategory[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase.from("product_categories").select("*").order("name");
    if (error) setError(error.message);
    else setItems(data as ProductCategory[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addCategory() {
    if (!name.trim()) return;
    const { error } = await supabase.from("product_categories").insert({ name, description });
    if (error) setError(error.message);
    else {
      setName("");
      setDescription("");
      void load();
    }
  }

  async function toggleActive(cat: ProductCategory) {
    await supabase.from("product_categories").update({ active: !cat.active }).eq("id", cat.id);
    void load();
  }

  return (
    <div>
      <PageTitle>Categorii</PageTitle>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Input placeholder="Nume categorie" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ flex: 2, minWidth: 220 }}>
            <Input
              placeholder="Descriere (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={() => void addCategory()}>Adauga</Button>
        </div>
      </Card>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Nume</Th>
              <Th>Descriere</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {items.map((cat) => (
              <tr key={cat.id}>
                <Td>{cat.name}</Td>
                <Td>{cat.description ?? "—"}</Td>
                <Td>
                  <Badge tone={cat.active ? "green" : "gray"}>{cat.active ? "Activ" : "Inactiv"}</Badge>
                </Td>
                <Td>
                  <Button variant="ghost" onClick={() => void toggleActive(cat)}>
                    {cat.active ? "Dezactiveaza" : "Activeaza"}
                  </Button>
                </Td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <Td>Nicio categorie inca.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
