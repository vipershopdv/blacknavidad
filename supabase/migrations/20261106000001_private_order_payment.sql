begin;

alter table public.clients
  add column payment_code text not null
  default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20)),
  add constraint clients_payment_code_format check (payment_code ~ '^[A-F0-9]{20}$');

create function private.blacknavidad_public_payment(p_number text, p_payment_code text)
returns table (total numeric, adelanto numeric, debe numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select c.total, c.adelanto, c.debe
  from public.clients as c
  where p_number ~ '^C-[0-9]{1,19}$' and c.id = p_number
    and p_payment_code ~ '^[A-F0-9]{20}$' and c.payment_code = p_payment_code;
$$;

revoke all on function private.blacknavidad_public_payment(text, text) from public, anon, authenticated;
grant execute on function private.blacknavidad_public_payment(text, text) to anon, authenticated;

create function public.lookup_order_payment(p_number text, p_payment_code text)
returns table (total numeric, adelanto numeric, debe numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.blacknavidad_public_payment(p_number, p_payment_code);
$$;

revoke all on function public.lookup_order_payment(text, text) from public, anon, authenticated;
grant execute on function public.lookup_order_payment(text, text) to anon, authenticated;

commit;
