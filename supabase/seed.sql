-- Date demo — Faza 1. Ruleaza DUPA 0001_schema.sql.
-- Utilizatorii (auth.users) NU se creeaza aici — Supabase Auth are propriul flux
-- (parola hash-uita, confirmare email etc.), fragil de reprodus corect in SQL
-- brut si dependent de versiunea Supabase. Creeaza-i manual din Dashboard:
-- Authentication -> Add user (email + parola), apoi copiaza ID-ul generat si
-- foloseste-l in INSERT-urile din `app_users` de mai jos (inlocuieste
-- '<ID-AUTH-EUTEH>' etc. cu ID-urile reale).

-- 3 companii demo (EUTEH e reala, per operator — celelalte doua sunt exemple).
insert into public.companies (id, company_name, cui, address, city, contact_person, email, phone, status) values
  ('11111111-1111-1111-1111-111111111111', 'EUTEH GRUP', 'RO12345678', 'Str. Exemplu 1', 'Bucuresti', 'Cristian Popescu', 'office@euteh.ro', '0742313704', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'SC Construct Pro SRL', 'RO23456789', 'Str. Fabricii 10', 'Cluj-Napoca', 'Ion Popescu', 'contact@constructpro.ro', '0722000001', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'SC Instal Total SRL', 'RO34567890', 'Bd. Industriei 5', 'Timisoara', 'Maria Ionescu', 'contact@instaltotal.ro', '0722000002', 'active');

-- 5 categorii (aliniate cu mockup-urile primite).
insert into public.product_categories (id, name, description) values
  ('c1111111-1111-1111-1111-111111111111', 'Consumabile sudura MIG-MAG', 'Sarme si consumabile pentru sudura MIG-MAG'),
  ('c2222222-2222-2222-2222-222222222222', 'Electrozi MMA', 'Electrozi pentru sudura manuala cu arc electric'),
  ('c3333333-3333-3333-3333-333333333333', 'Sarme TIG-WIG', 'Sarme si baghete pentru sudura TIG'),
  ('c4444444-4444-4444-4444-444444444444', 'Aparate de sudura', 'Echipamente si aparate de sudura'),
  ('c5555555-5555-5555-5555-555555555555', 'Accesorii si protectie', 'Accesorii, consumabile auxiliare si echipament de protectie');

-- 15+ produse.
insert into public.products (sku, name, category_id, base_price, unit, active) values
  ('ALL-MIG-001', 'Sarma cupru MIG-MAG ER70S-6 1.0mm', 'c1111111-1111-1111-1111-111111111111', 24.50, 'kg', true),
  ('ALL-MIG-002', 'Sarma cupru MIG-MAG ER70S-6 1.2mm', 'c1111111-1111-1111-1111-111111111111', 23.90, 'kg', true),
  ('ALL-MIG-003', 'Sarma inox MIG 308LSi 1.0mm', 'c1111111-1111-1111-1111-111111111111', 32.00, 'kg', true),
  ('ALL-INOX-25', 'Electrozi inox E308L 2.5mm', 'c2222222-2222-2222-2222-222222222222', 18.90, 'kg', true),
  ('ALL-316L-25', 'Electrozi inox E316L 2.5mm', 'c2222222-2222-2222-2222-222222222222', 25.00, 'kg', true),
  ('ALL-316L-32', 'Electrozi inox E316L 3.2mm', 'c2222222-2222-2222-2222-222222222222', 19.80, 'kg', true),
  ('ALL-DUPLEX-25', 'Electrozi super duplex 2.5mm', 'c2222222-2222-2222-2222-222222222222', 29.40, 'kg', true),
  ('ALL-MMA-001', 'Electrozi bazici E7018 3.2mm', 'c2222222-2222-2222-2222-222222222222', 8.50, 'kg', true),
  ('ALL-TIG-001', 'Baghete TIG aluminiu AlMg5 2.4mm', 'c3333333-3333-3333-3333-333333333333', 28.00, 'kg', true),
  ('ALL-TIG-002', 'Baghete TIG inox 308L 2.4mm', 'c3333333-3333-3333-3333-333333333333', 26.50, 'kg', true),
  ('ALL-EQ-001', 'Aparat sudura MIG/MAG 250A', 'c4444444-4444-4444-4444-444444444444', 1450.00, 'buc', true),
  ('ALL-EQ-002', 'Aparat sudura TIG/WIG 200A', 'c4444444-4444-4444-4444-444444444444', 1890.00, 'buc', true),
  ('ALL-EQ-003', 'Invertor sudura MMA 160A', 'c4444444-4444-4444-4444-444444444444', 620.00, 'buc', true),
  ('ALL-ACC-001', 'Masca de sudura automata', 'c5555555-5555-5555-5555-555555555555', 145.00, 'buc', true),
  ('ALL-ACC-002', 'Manusi de protectie sudura', 'c5555555-5555-5555-5555-555555555555', 22.00, 'buc', true),
  ('ALL-ACC-003', 'Duze de contact MIG 1.0mm (set 10 buc)', 'c5555555-5555-5555-5555-555555555555', 15.00, 'set', true),
  ('ALL-DISC-125', 'Disc abraziv 125mm', 'c5555555-5555-5555-5555-555555555555', 2.10, 'buc', true);

-- Discounturi diferite per companie si categorie (nu toate combinatiile).
insert into public.client_category_discounts (company_id, category_id, discount_percentage) values
  ('11111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 14),
  ('11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 10),
  ('22222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 12),
  ('22222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 8),
  ('33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 15),
  ('33333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', 10);

-- Comenzi demo (inserate direct — fluxul UI de comanda e Faza 5, nu inca).
insert into public.orders (id, company_id, user_id, order_number, status, subtotal, discount_total, total)
select
  'a1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  u.id,
  'ALY-2026-0001',
  'confirmed',
  107.50, 17.50, 90.00
from public.app_users u where u.company_id = '11111111-1111-1111-1111-111111111111' limit 1;

-- NOTA: acest INSERT de comanda produce 0 randuri pana nu exista cel putin un
-- app_users legat de compania EUTEH (vezi instructiunile de mai sus). Ruleaza-l
-- DUPA ce ai creat si legat utilizatorii demo.
