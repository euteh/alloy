# Design Reference — viziune completa UI/UX (2026-09-18)

Specificatie primita integral de la operator, pastrata ca reper pentru TOATE
fazele (nu scop de construit dintr-o data — decizie explicita a operatorului:
ramanem etapizati, acest document alimenteaza fiecare prompt Lovable pe masura
ce ajungem la faza relevanta).

## Stil vizual
- Rosu aprins **#DC2626** ca si culoare de brand (inlocuieste presupunerea
  anterioara `#B91C2C` din `brand-reference` — asta e valoarea data explicit
  de operator, foloseste-o de acum in toate prompturile).
- Alb, gri deschis, elemente negre/antracit. Stil enterprise, curat, profesional.

## Navigare — mobil-first, responsive
- **Desktop**: sidebar lateral (deja in Faza 1).
- **Mobil**: bottom bar cu Acasa/Dashboard, Catalog produse, Cos, Comenzile mele,
  Profil/Cont companie. Aplicat de la Faza 1 (costa putin sa fie corect de la
  inceput, chiar daca paginile din spate sunt inca simple).

## Portal client — viziune tinta (Faza 4-5, NU Faza 1)
- Dashboard client: mesaj de bun venit personalizat, cautare rapida (nume/cod),
  carduri de categorii cu iconite (Consumabile sudura MIG-MAG, Electrozi MMA,
  Sarme TIG-WIG, Aparate de sudura, Echipamente plasma, Accesorii/protectie),
  "Produse accesate recent".
- Catalog + filtrare avansata; card de produs cu stoc in timp real, pret de
  lista, discount personalizat, pret final calculat (inclusiv per kg unde e
  cazul), selector de cantitate, buton "Fisa tehnica (PDF)".
- Cos: sumar cu preturi unitare, valoare totala, discount aplicat, total fara
  TVA, buton "Genereaza comanda (PDF)" -> ecran de succes cu descarcare PDF,
  trimitere email, link catre istoric.

## CRM intern — viziune tinta (Faza 3 + Faza 7, NU Faza 1)
- Dashboard managerial cu carduri+grafice: clienti activi, produse active,
  comenzi, valoare comenzi; grafic "Comenzi pe luna"; tabel "Top clienti".
  (Cifrele din mockup — 248/5.320/186/125.430 € — sunt exemple, nu tinte reale.)
- Modul de sincronizare Google Sheets cu raport vizual (verificate/modificate/
  noi/dezactivate/erori) — deja documentat in `GOOGLE_SHEETS_STRUCTURE.md`.
- Administrare modulara: clienti, categorii, discounturi per client+categorie,
  utilizatori interni/externi cu RBAC (roluri si permisiuni), rapoarte de
  vanzari.

## Detaliu vizual exact, din mockup-urile mobile primite (2026-09-18)

Patru ecrane numerotate, extrase pixel-cu-pixel — folosite ca referinta exacta
cand se scrie prompt-ul de Faza 4-5 (portal functional):

**1. Ecran principal (Portal Client)**: logo Alloy + cos cu badge numeric in
header. „Bun venit!" + „Cauta produsul de care ai nevoie." + input cu placeholder
„Cauta dupa denumire sau cod...". Grid de 6 carduri de categorii cu iconita (
Consumabile sudura MIG-MAG, Electrozi MMA, Sarme TIG-WIG, Aparate de sudura,
Echipamente plasma, Accesorii si protectie). Sectiune „Produse accesate recent"
cu link „Vezi toate". Bottom nav: **Acasa, Categorii, Cos, Comenzi, Profil**
(5 iconite, exact aceasta ordine si aceste denumiri — inlocuiesc „Catalog
produse"/„Comenzile mele" din specificatia text anterioara pentru bottom bar).

**2. Cautare + detaliu produs**: rezultatele cautarii = lista cu poza mica,
nume, diametru, cod SKU, status disponibilitate (punct verde „In stoc" / punct
galben „La comanda"), pret, buton rosu de cos direct pe rand (adaugare fara sa
deschizi produsul — confirma regula deja documentata in USER_FLOWS.md). Pagina
de detaliu: poza mare, nume, diametru, „Cod produs: ALL-316L-25", categorie,
producator, badge verde „In stoc" + „Actualizat: azi, 10:20" (timestamp ultimei
sincronizari — camp de adaugat pe `products` cand se implementeaza Faza 3).
Bloc de pret: „Pret lista: 25,00 €", „Discount companie: -14%", „Pretul tau:
21,50 € /kg" (evidentiat, cu unitatea de masura per kg unde e cazul — NU toate
produsele au pret per kg, doar cele vandute la greutate, ex. sarma/electrozi).
Stepper de cantitate cu unitatea vizibila („kg"), buton rosu „Adauga in cos",
link „Fisa tehnica (PDF)".

**3. Cos + succes comanda**: randuri cu poza mica, nume+diametru+cod, stepper
cantitate, pret, iconita de sters (cos rosu); link „Sterge tot" in header.
Sumar: Subtotal / Discount total (negativ, ex. „-24,85 €") / Total (fara TVA),
buton rosu „Genereaza comanda (PDF)". Ecran de succes: bifa verde mare,
„Comanda a fost generata cu succes!", „Nr. comanda: ALY-2024-0156" (format
`ALY-{an}-{secventa pe 4 cifre}` — util pentru generarea `order_number`),
„Data: {zi.luna.an}", trei butoane: „Descarca PDF" / „Trimite pe e-mail" /
„Vezi comenzile mele".

**4. CRM Intern (desktop)**: sidebar identic cu ce am deja in Faza 1, plus
modulul vizual „Sincronizare produse din Google Sheets": Sursa date Google
Sheets (link) -> Sincronizare automata zilnica -> Produse actualizate (preturi,
stocuri, informatii tehnice) -> Disponibile in portalul clientilor. Confirma
exact fluxul deja documentat in `GOOGLE_SHEETS_STRUCTURE.md`.

## Nota despre RBAC
Schema actuala (`0001_schema.sql`) are doar doua roluri (`admin`/`client_b2b`),
suficiente pentru izolarea de date ceruta acum. "Roluri si permisiuni" mai
granulare (ex. utilizatori interni Alloy cu acces partial) e un rafinament de
Faza 7 (CRM avansat) — schema se poate extinde atunci fara sa rupa ce exista.
