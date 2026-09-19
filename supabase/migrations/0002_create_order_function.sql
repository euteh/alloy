-- Genereaza o comanda din cos, cu pret/discount recalculate SERVER-SIDE.
-- Clientul trimite doar {product_id, quantity} — pretul, discountul si totalul
-- se calculeaza aici, din `products`/`client_category_discounts`, nu din ce
-- trimite browser-ul (regula din USER_FLOWS.md, acum si aplicata, nu doar scrisa).

create sequence if not exists public.order_number_seq;

create or replace function public.create_order(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_discount_total numeric := 0;
  v_total numeric := 0;
  item jsonb;
  v_product public.products%rowtype;
  v_discount numeric;
  v_final_price numeric;
  v_line_total numeric;
  v_qty int;
begin
  if v_user_id is null then
    raise exception 'Neautentificat';
  end if;

  select company_id into v_company_id from public.app_users where id = v_user_id;
  if v_company_id is null then
    raise exception 'Utilizatorul nu este asociat unei companii client';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cosul este gol';
  end if;

  v_order_number := 'ALY-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0');

  insert into public.orders (company_id, user_id, order_number, status, subtotal, discount_total, total)
  values (v_company_id, v_user_id, v_order_number, 'submitted', 0, 0, 0)
  returning id into v_order_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products
      where id = (item->>'product_id')::uuid and active = true;
    if not found then
      raise exception 'Produs inexistent sau inactiv: %', item->>'product_id';
    end if;

    v_qty := (item->>'quantity')::int;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Cantitate invalida pentru produsul %', v_product.sku;
    end if;

    select coalesce(max(discount_percentage), 0) into v_discount
      from public.client_category_discounts
      where company_id = v_company_id and category_id = v_product.category_id;

    v_final_price := round(v_product.base_price * (1 - v_discount / 100), 2);
    v_line_total := round(v_final_price * v_qty, 2);

    insert into public.order_items
      (order_id, product_id, quantity, base_unit_price, discount_percentage, final_unit_price, line_total)
    values
      (v_order_id, v_product.id, v_qty, v_product.base_price, v_discount, v_final_price, v_line_total);

    v_subtotal := v_subtotal + round(v_product.base_price * v_qty, 2);
    v_total := v_total + v_line_total;
  end loop;

  v_discount_total := v_subtotal - v_total;

  update public.orders
    set subtotal = v_subtotal, discount_total = v_discount_total, total = v_total, updated_at = now()
    where id = v_order_id;

  return v_order_id;
end;
$$;

grant execute on function public.create_order(jsonb) to authenticated;
