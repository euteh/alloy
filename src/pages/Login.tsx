import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Input } from "@/components/ui/primitives";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) setError(error);
    setSubmitting(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--alloy-gray-100)",
      }}
    >
      <Card style={{ width: 340 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "var(--alloy-red)", marginBottom: 4 }}>
          ALLOY B2B
        </div>
        <div style={{ fontSize: 13, color: "var(--alloy-gray-500)", marginBottom: 20 }}>
          Autentificare
        </div>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <div style={{ marginBottom: 12 }}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              type="password"
              placeholder="Parola"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ color: "var(--alloy-red)", fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}
          <Button type="submit" style={{ width: "100%" }} disabled={submitting}>
            {submitting ? "Se conecteaza..." : "Conectare"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
