# Fluxuri principale — Alloy B2B Platform

## Flux 1 — Admin Alloy configureaza un client nou
1. Admin creeaza compania (`companies`: nume, CUI, adresa, contact).
2. Admin creeaza utilizatorul/utilizatorii companiei (`app_users`, `role = client_b2b`,
   legati obligatoriu de acea companie).
3. Admin seteaza discounturile per categorie pentru acea companie
   (`client_category_discounts`) — lipsa unui rand pentru o categorie = 0%.

## Flux 2 — Client B2B cauta si comanda (viziune tinta, Faza 4-5, nu Faza 1)
```
Cauta produs (nume/SKU, partial, tolerant la typo)
  -> Gaseste (rezultate cu pret client deja calculat: pret_baza - discount)
    -> Verifica (deschide fisa produsului daca vrea detaliu)
      -> Adauga in cos
        -> Genereaza comanda (validare stoc/cantitati, recalcul preturi SERVER-SIDE,
           snapshot in order_items, numar comanda, PDF, salvare istoric, trimitere email)
```
Regula neschimbata: pretul si discountul se valideaza si calculeaza server-side,
niciodata pe baza valorilor trimise de browser.

## Flux 3 — Sincronizare catalog (Faza 3, nu Faza 1)
```
Google Sheet (sursa) -> preluare programata -> validare randuri
  -> comparare cu products existent (pe sku) -> aplica doar diferentele
    -> indexare cautare -> raport de sincronizare in CRM (verificate/modificate/noi/dezactivate/erori)
```

## Flux 4 — Izolare de date (verificare de securitate, nu UI)
Un `client_b2b` autentificat NU poate:
- vedea `companies`/`app_users`/`client_category_discounts`/`orders`/`order_items`
  ale altei companii (RLS Postgres, verificat prin `company_id` citit server-side).
- forta `company_id` printr-un payload manipulat la creare de comanda (RLS
  `WITH CHECK` compara mereu cu `current_app_company()`, nu cu ce trimite clientul).

## Ce ramane in afara Fazei 1 (fundatie)
Fluxurile 2 si 3 de mai sus sunt viziunea tinta, documentata acum ca sa ghideze
schema (deja pregatita pentru ele), dar NU se implementeaza operational in
Faza 1 — doar structura de date si securitatea. Interfata completa de cautare/cos/
comanda si sincronizarea reala vin in prompturile Lovable urmatoare (Faza 3-5).
