# Alloy B2B Platform — arhitectura (Faza 0, inainte de Lovable)

Sinteza celor doua diagrame + a documentului de strategie primite de la operator
(2026-09-18), redusa la ce se construieste efectiv. Cost/faze comerciale raman
in discutia cu operatorul, nu se repeta aici.

## Harta modulelor

```
ALLOY B2B PLATFORM
        |
   +----+----+
   |         |
CRM INTERN   PORTAL B2B
   |         |
Clienti      Cautare
Produse      Produse (catalog)
Comenzi      Cos
Discounturi  Comanda -> PDF -> Email
Utilizatori
   |         |
   +----+----+
        |
  CATALOG CENTRAL (baza de date proprie — sursa de adevar pentru Portal)
        |
  Data Sync Engine
        |
  Google Sheets (sursa externa, doar citire)
```

**Principiu-cheie (din strategia primita):** Portalul B2B NU citeste niciodata direct
Google Sheets. Sync Engine-ul copiaza periodic in `products`/`product_categories`
(schema din `supabase/migrations/0001_schema.sql`); portalul si CRM-ul lucreaza
exclusiv cu baza de date proprie. Performanta si izolarea de sursa externa depind
de asta.

## Servicii independente (nu module UI cuplate)

- **OrderService** — validare cos -> creeaza `orders` + `order_items` cu snapshot de
  pret (vezi mai jos). Nu stie nimic despre PDF sau email.
- **PdfService** — primeste un `order_id`, genereaza PDF-ul. Schimbarea template-ului
  nu atinge `OrderService`.
- **EmailService** — primeste un PDF + destinatar, il trimite. Schimbarea
  furnizorului de email (Resend/altul) nu atinge `OrderService` sau `PdfService`.
- **SyncEngine** (Faza 3, nu Faza 1) — citeste Google Sheets, valideaza, compara cu
  `products` existent, aplica DOAR diferentele (upsert pe `sku`), logheaza rezultatul.

## Snapshot de pret — regula neschimbata din specificatie

`order_items.base_unit_price`, `discount_percentage`, `final_unit_price` se
copiaza din `products` + `client_category_discounts` IN MOMENTUL comenzii si nu
se mai recalculeaza niciodata. O comanda veche ramane corecta chiar daca preturile
sau discounturile se schimba ulterior. Asta e deja impus de schema (coloane proprii
pe `order_items`, nu un JOIN live).

## Izolare de date — impusa la nivel de baza de date, nu doar in UI

Fiecare tabel sensibil (`companies`, `app_users`, `client_category_discounts`,
`orders`, `order_items`) are RLS (Row Level Security) Postgres: un `client_b2b`
vede STRICT randurile propriei companii (verificat prin `company_id`, citit
server-side din `app_users`, niciodata din payload-ul trimis de browser).
`products`/`product_categories` raman comune (acelasi catalog pentru toti),
doar discounturile si comenzile sunt izolate.

## Cautare (Faza 4, nu Faza 1)

Fundatia (Faza 1-2) pune deja indexii `pg_trgm` pe `products.name` si `products.sku`
(vezi schema) — suficient pentru cautare partiala/tolerant la typo-uri prin Postgres
nativ, fara motor de search extern, la volumul descris (mii de produse). Un motor
dedicat (Elastic/Meilisearch) ramane optiune viitoare daca volumul/complexitatea
cresc — nu se construieste in V1.

## Ordinea reala de implementare (Faza 1 = ce livram acum ca schema+prompt Lovable)

Fazele 1-2 din strategia primita (Fundatie + Catalog) sunt exact ce acopera
`0001_schema.sql`: auth, roluri, companii, utilizatori, categorii, produse,
discounturi, comenzi (structura, nu fluxul complet). Fazele 3 (sincronizare),
5 (cos+comanda functionala), 6 (PDF+email), 7 (CRM avansat) raman etape separate,
fiecare cu propriul prompt Lovable, DUPA ce Faza 1-2 e verificata si stabila.
