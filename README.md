# Alloy B2B Platform

CRM intern (Alloy Romania) + portal B2B pentru clienti (inclusiv EUTEH). Construit
direct ca aplicatie Vite + React + TypeScript + Supabase — nu in Lovable (decizie
finala a operatorului, 2026-09-19, dupa un pivot anterior catre Lovable care a
fost abandonat).

## Continut de referinta (pastrat din faza de planificare)
- `ARCHITECTURE.md`, `USER_FLOWS.md`, `GOOGLE_SHEETS_STRUCTURE.md`,
  `DESIGN_REFERENCE.md` — raman valabile ca documentatie de arhitectura/design,
  chiar daca `lovable-prompts/faza-1-fundatie.md` nu se mai foloseste ca prompt
  (ramane doar ca istoric al specificatiei Fazei 1).

## Setup local
```bash
npm install
cp .env.example .env   # completeaza VITE_SUPABASE_URL si VITE_SUPABASE_ANON_KEY
npm run dev
```

Trebuie creat un proiect Supabase (gratuit) si rulate, in ordine:
1. `supabase/migrations/0001_schema.sql` (schema + RLS)
2. `supabase/seed.sql` (date demo — citeste notele din fisier, utilizatorii
   Auth se creeaza manual din Dashboard, nu prin SQL)

## Stare (Faza 1 — fundatie)
Implementat si verificat (`tsc --noEmit` 0 erori, `npm run dev` porneste):
autentificare, roluri (admin/client_b2b), izolare de date prin RLS, CRUD complet
pe clienti/produse/categorii/discounturi/utilizatori, catalog + cautare simpla
in portal cu pret calculat pe baza discountului companiei.

**Netestat**: comportament real fata de o baza Supabase live — nu exista inca
proiect Supabase creat/conectat in acest mediu.

**Neimplementat inca** (fazele urmatoare, per `ARCHITECTURE.md`): cos si generare
comanda functionala (PDF/email), sincronizare automata din Google Sheets,
cautare avansata (tolerant la typo-uri — indexii `pg_trgm` sunt deja in schema),
rapoarte.

## Repo
`https://github.com/euteh/alloy` (branch `main`).
