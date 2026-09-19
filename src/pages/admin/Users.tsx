import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AppUser, Company } from "@/lib/types";
import { Badge, Button, Card, Input, PageTitle, Select, Table, Td, Th } from "@/components/ui/primitives";

const EMPTY = { name: "", email: "", company_id: "", role: "client_b2b" as AppUser["role"] };

/**
 * NOTA: creaza intai contul in Supabase Auth (semnatura de mana, admin-ul
 * primeste parola provizorie separat — pentru prototip, nu construim inca un
 * flux de invitatie prin email, per specificatia primita). Formularul de aici
 * scrie DOAR randul din app_users pentru un auth.users.id deja existent.
 */
export function Users() {
  const [items, setItems] = useState<AppUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [authUserId, setAuthUserId] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [users, comps] = await Promise.all([
      supabase.from("app_users").select("*").order("name"),
      supabase.from("companies").select("*").order("company_name"),
    ]);
    if (users.error) setError(users.error.message);
    else setItems(users.data as AppUser[]);
    if (comps.data) setCompanies(comps.data as Company[]);
  }

  useEffect(() => {
    void load();
  }, []);

  function companyName(id: string | null) {
    return companies.find((c) => c.id === id)?.company_name ?? "—";
  }

  async function addUser() {
    if (!authUserId.trim() || !form.name.trim() || !form.email.trim()) return;
    if (form.role === "client_b2b" && !form.company_id) {
      setError("Un utilizator client_b2b trebuie asociat unei companii.");
      return;
    }
    const { error } = await supabase.from("app_users").insert({
      id: authUserId.trim(),
      name: form.name,
      email: form.email,
      role: form.role,
      company_id: form.role === "admin" ? null : form.company_id,
    });
    if (error) setError(error.message);
    else {
      setAuthUserId("");
      setForm(EMPTY);
      void load();
    }
  }

  async function toggleStatus(u: AppUser) {
    await supabase
      .from("app_users")
      .update({ status: u.status === "active" ? "disabled" : "active" })
      .eq("id", u.id);
    void load();
  }

  return (
    <div>
      <PageTitle>Utilizatori</PageTitle>
      {error && <div style={{ color: "var(--alloy-red)", marginBottom: 12 }}>{error}</div>}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "var(--alloy-gray-500)", marginBottom: 8 }}>
          Creaza intai contul in Supabase Auth (Dashboard → Authentication → Add user), apoi
          lipeste ID-ul lui aici ca sa-l legi de un rol si o companie.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          <Input
            placeholder="ID utilizator (auth.users.id)"
            value={authUserId}
            onChange={(e) => setAuthUserId(e.target.value)}
          />
          <Input placeholder="Nume" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as AppUser["role"] })}
          >
            <option value="client_b2b">Client B2B</option>
            <option value="admin">Admin</option>
          </Select>
          {form.role === "client_b2b" && (
            <Select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
              <option value="">Alege compania</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </Select>
          )}
        </div>
        <div style={{ marginTop: 10 }}>
          <Button onClick={() => void addUser()}>Asociaza utilizator</Button>
        </div>
      </Card>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Nume</Th>
              <Th>Email</Th>
              <Th>Rol</Th>
              <Th>Companie</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <Td>{u.name}</Td>
                <Td>{u.email}</Td>
                <Td>{u.role === "admin" ? "Admin" : "Client B2B"}</Td>
                <Td>{companyName(u.company_id)}</Td>
                <Td>
                  <Badge tone={u.status === "active" ? "green" : "gray"}>{u.status}</Badge>
                </Td>
                <Td>
                  <Button variant="ghost" onClick={() => void toggleStatus(u)}>
                    {u.status === "active" ? "Dezactiveaza" : "Activeaza"}
                  </Button>
                </Td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <Td>Niciun utilizator inca.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
