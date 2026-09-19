import { Card, PageTitle } from "@/components/ui/primitives";

export function Settings() {
  return (
    <div>
      <PageTitle>Setari</PageTitle>
      <Card>
        <p style={{ color: "var(--alloy-gray-500)", fontSize: 14 }}>
          Placeholder pentru Faza 7 (CRM avansat) — configurari generale, integrare
          sincronizare Google Sheets, sabloane PDF/email.
        </p>
      </Card>
    </div>
  );
}
