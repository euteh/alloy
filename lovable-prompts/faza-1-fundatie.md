# Prompt Lovable — Faza 1: Fundatia

Copiaza tot ce urmeaza intr-un proiect Lovable nou (Supabase activat din start).
Nu contine inca fluxul de comanda, cautare sau sincronizare — doar fundatia
ceruta explicit inainte de orice altceva.

---

Construieste fundatia unei platforme B2B numite **Alloy B2B**, pentru un
distribuitor de echipamente si consumabile industriale. Aplicatia are doua zone:

1. **CRM intern** (rol `admin`) — acces complet la clienti, utilizatori, produse,
   categorii, discounturi, comenzi.
2. **Portal B2B** (rol `client_b2b`) — fiecare companie client vede STRICT
   propriile date (utilizatori, discounturi, comenzi). Produsele si categoriile
   sunt un catalog comun, vizibil tuturor.

Ruleaza EXACT schema SQL de mai jos ca prima migrare (nu regenera alta schema,
foloseste-o pe asta ca sa ramana compatibila cu documentatia deja scrisa):

```sql
<< lipeste aici integral continutul din supabase/migrations/0001_schema.sql >>
```

## Autentificare si roluri

- Foloseste Supabase Auth (email+parola e suficient pentru prototip).
- La signup/creare de utilizator din CRM, se creeaza obligatoriu si un rand in
  `app_users` (trigger sau server function) cu `role` si `company_id` corecte —
  niciodata setate din formularul de pe frontend fara validare server-side.
- Un `client_b2b` NU trebuie sa poata alege singur `company_id` la inregistrare —
  contul lui e creat DOAR de admin, din CRM, deja legat de compania corecta.

## Layout si navigare

**Desktop** — sidebar cu doua sectiuni (vizibile dupa rol):

**CRM INTERN** (doar `admin`): Dashboard, Clienti, Produse, Categorii, Comenzi,
Discounturi, Utilizatori, Setari.

**PORTAL CLIENT** (doar `client_b2b`): Catalog produse, Cos, Comenzile mele, Profil.

**Mobil** (doar rol `client_b2b`) — bottom bar cu exact 5 iconite, aceasta ordine
si aceste denumiri: **Acasa, Categorii, Cos, Comenzi, Profil**.

Branding: rosu `#DC2626` ca accent principal (butoane primare, elemente active),
fundal alb/gri deschis, elemente negre/antracit pentru text. Header cu numele
utilizatorului autentificat + rol. Fara animatii inutile. Design mobil-first,
complet functional si pe desktop.

## Pagini de construit acum (doar structura + CRUD de baza, fara logica de comanda)

- **Dashboard** (admin): carduri simple — numar clienti activi, numar produse,
  numar comenzi (0 pentru moment, tabelul exista dar e gol de flux real).
- **Clienti** (admin): tabel cu toate companiile (`companies`) — companie, CUI,
  persoana de contact, email, telefon, status, numar utilizatori, numar comenzi,
  buton "Vezi client" -> pagina de detaliu cu tab-uri: Informatii companie,
  Utilizatori, Discounturi, Comenzi (pot fi goale/placeholder pentru comenzi).
- **Produse** (admin): CRUD complet pe `products` (formular cu toate campurile
  din schema).
- **Categorii** (admin): CRUD simplu pe `product_categories`.
- **Discounturi** (admin): formular cu 3 selecturi (companie, categorie, procent)
  care scrie in `client_category_discounts`. Afiseaza tabelul discounturilor
  existente, editabile.
- **Utilizatori** (admin): CRUD pe `app_users`, cu asociere obligatorie la o
  companie pentru rolul `client_b2b`. Activare/dezactivare (camp `status`).
- **Comenzi** (admin): doar tabel gol/placeholder deocamdata (schema exista,
  fluxul de creare vine in Faza 5).
- **Setari** (admin): pagina goala, placeholder.
- **Catalog produse** (client_b2b): lista simpla a produselor active, cu pretul
  calculat (`base_price` minus discountul companiei pentru categoria produsului,
  0% daca nu exista rand de discount) — FARA cautare avansata inca (asta e Faza 4).
- **Cos / Comenzile mele / Profil** (client_b2b): pagini placeholder, fara logica
  functionala inca.

## Date demo

Creeaza:
- 3 companii B2B realiste (nume, CUI, oras din Romania).
- 2 utilizatori per companie (un admin de companie + un coleg), rol `client_b2b`.
- 5 categorii de produse (relevante pentru sudura/echipamente industriale, ex.
  Consumabile sudura, Echipamente, Accesorii, Protectie, Oxigaz).
- Minimum 15 produse, distribuite pe cele 5 categorii, cu preturi realiste.
- Cateva discounturi diferite per companie si categorie (nu toate combinatiile).
- 2-3 comenzi demo (inserate direct in `orders`/`order_items`, nu prin flux UI —
  fluxul de comanda nu exista inca in aceasta faza).

## Ce NU construi inca (explicit, nu uita)

- Fluxul complet de cos -> comanda -> PDF -> email.
- Cautarea avansata (tolerant la typo-uri, full-text).
- Sincronizarea automata din Google Sheets.
- Rapoarte avansate.

## La final

Verifica aplicatia (typecheck, un utilizator admin poate vedea tot, un utilizator
client_b2b NU poate vedea datele altei companii nici macar manipuland URL-ul),
repara erorile gasite, si raporteaza succint ce ai implementat.
