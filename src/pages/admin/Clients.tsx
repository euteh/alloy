import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Company } from "@/lib/types";
import { Badge, Button, Card, Input, PageTitle, Table, Td, Th } from "@/components/ui/primitives";

const EMPTY = { company_name: "", cui: "", contact_person: "", email: "", phone: "" };

export function Clients() {
  const [items, setItems] = useState<Company[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase.from("companies").select("*").order("company_name");
    if (error) setError(error.message);
    else setItems(data as Company[]);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addCompany() {
    if (!form.company_name.trim() || !form.cui.trim()) return;
    const { error } = await supabase.from("companies").insert({ ...form, status: "active" });
    if (error) setError(error.message);
    else {
      setForm(EMPTY);
      void load();
    }
  }

  return (
    <div>
      <PageTitle>Clienti</PageTitle>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          <Input
            placeholder="Companie"
            value={form.company_name}
            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          />
          <Input placeholder="CUI" value={form.cui} onChange={(e) => setForm({ ...form, cui: e.target.value })} />
          <Input
            placeholder="Persoana contact"
            value={form.contact_person}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Telefon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <Button onClick={() => void addCompany()}>Adauga client</Button>
        </div>
      </Card>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Companie</Th>
              <Th>CUI</Th>
              <Th>Contact</Th>
              <Th>Email</Th>
              <Th>Telefon</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <Td>{c.company_name}</Td>
                <Td>{c.cui}</Td>
                <Td>{c.contact_person ?? "—"}</Td>
                <Td>{c.email ?? "—"}</Td>
                <Td>{c.phone ?? "—"}</Td>
                <Td>
                  <Badge tone={c.status === "active" ? "green" : "gray"}>{c.status}</Badge>
                </Td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <Td>Niciun client inca.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
