# Structura Google Sheet pentru sincronizarea catalogului (Faza 3, propunere)

Nu implementata inca — asta e specificatia pe care Sync Engine-ul (Faza 3) o va
citi. Necesara acum ca sa "inghetam" formatul inainte de a scrie prompturi Lovable
pentru sincronizare, per cererea operatorului.

## Foaie: `Produse`

Un rand = un produs. Antet exact (nume de coloana = cheie de mapare in cod, NU
schimba denumirile fara sa actualizezi si Sync Engine-ul):

| Coloana         | Obligatoriu | Mapeaza la              | Note |
|-----------------|-------------|--------------------------|------|
| `sku`           | DA          | `products.sku`           | Cheie unica — randul cu acelasi SKU actualizeaza produsul existent, nu creeaza duplicat. |
| `nume`          | DA          | `products.name`          | |
| `categorie`     | DA          | `products.category_id`   | Numele categoriei (text), mapat la id prin `product_categories.name`. Categorie noua -> se creeaza automat sau se raporteaza ca eroare (de decis in Faza 3). |
| `descriere_scurta` | nu       | `products.short_description` | |
| `descriere`     | nu          | `products.description`   | |
| `pret_baza`     | DA          | `products.base_price`    | Numeric, fara simbol de moneda in celula (ex. `125.00`, nu `125 €`). |
| `fisa_tehnica_url` | nu       | `products.technical_sheet_url` | Link direct (PDF sau pagina). |
| `imagine_url`   | nu          | `products.image_url`     | |
| `activ`         | DA          | `products.active`        | `DA` / `NU` (sau `TRUE`/`FALSE`) — un produs marcat `NU` se dezactiveaza, nu se sterge. |

## Reguli de sincronizare (Faza 3, ghid pentru prompt-ul Lovable de atunci)

1. **Upsert pe `sku`**: randul din Sheet cu un `sku` deja existent in `products`
   ACTUALIZEAZA produsul; un `sku` nou CREEAZA produs nou.
2. **Fara stergeri automate**: un SKU disparut din Sheet NU se sterge din baza de
   date — se marcheaza `active = false` (evita pierderea de istoric legat de
   comenzi vechi care refera acel produs).
3. **Validare inainte de aplicare**: randuri fara `sku`/`nume`/`pret_baza` valide
   se resping individual si se raporteaza ca eroare — NU opresc restul sincronizarii.
4. **Raport dupa fiecare rulare** (afisat in CRM, per mockup-ul primit): produse
   verificate, modificate, noi, dezactivate, erori (cu detaliu pe fiecare eroare).
5. **Sursa ramane doar de citire**: sincronizarea niciodata nu scrie inapoi in
   Google Sheet.

## De confirmat cu operatorul inainte de Faza 3
- Exact ce Google Sheet (link-ul real, cel folosit deja pentru preturile de sudura?
  Sau unul nou, dedicat acestei platforme?).
- Cine are drept de editare pe Sheet (doar Alloy, sau si Cristi?).
- Frecventa reala dorita (mockup-ul arata "zilnic" — confirmam sau ajustam).
