# Alloy B2B Platform — pachet de planificare (inainte de Lovable)

Livrabile pregatite la cererea explicita a operatorului: „nu as incepe inca sa
construim in Lovable — as face mai intai schema completa + arhitectura +
fluxurile + structura Google Sheets, apoi prompturi Lovable etapizate."

## Continut

- `ARCHITECTURE.md` — harta modulelor, servicii independente (Order/PDF/Email),
  principiul „portalul nu citeste live Google Sheets".
- `supabase/migrations/0001_schema.sql` — schema completa Postgres/Supabase
  (Faza 1-2): companii, utilizatori, categorii, produse, discounturi, comenzi,
  cu RLS (izolare de date impusa in baza de date, nu doar in UI).
- `USER_FLOWS.md` — fluxurile principale (admin configureaza client, client
  cauta si comanda, sincronizare catalog, izolare de date).
- `GOOGLE_SHEETS_STRUCTURE.md` — formatul exact pe care Sync Engine-ul (Faza 3)
  il va astepta de la Google Sheet.
- `lovable-prompts/faza-1-fundatie.md` — primul prompt, gata de copiat in
  Lovable, pentru fundatie (auth, roluri, companii, utilizatori, catalog, CRUD
  de baza, date demo). Fara cautare avansata, cos/comanda functionala sau
  sincronizare — acelea sunt prompturi separate, urmatoare.

## Ordinea urmatoare
1. Operatorul confirma/ajusteaza schema si structura Google Sheets.
2. Ruleaza `faza-1-fundatie.md` in Lovable.
3. Se verifica fundatia (izolarea de date, rolurile) inainte de urmatorul prompt.
4. Se scriu prompturile pentru Faza 3 (sincronizare), 4 (portal + cautare),
   5 (cos+comanda), 6 (PDF+email), 7 (CRM avansat) — cate unul, dupa ce faza
   anterioara e stabila.
