begin;

drop function if exists public.lookup_order_payment(text, text);
drop function if exists private.blacknavidad_public_payment(text, text);
alter table public.clients drop column if exists payment_code;

drop function public.lookup_order_status(text);
drop function private.blacknavidad_public_status(text);

-- Public lookup by order number. Do not return phone numbers or other contact fields.
create function private.blacknavidad_public_status(p_code text)
returns table (
  id text, estado text, fuentes integer, fuentes_listas integer,
  total numeric, adelanto numeric, debe numeric, nombre text, contenido text
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.estado, c.fuentes, c.fuentes_listas, c.total, c.adelanto, c.debe, c.nombre, c.contenido
  from public.clients as c
  where p_code ~ '^C-[0-9]{1,19}$' and c.id = p_code;
$$;

revoke all on function private.blacknavidad_public_status(text) from public, anon, authenticated;
grant execute on function private.blacknavidad_public_status(text) to anon, authenticated;

create function public.lookup_order_status(p_code text)
returns table (
  id text, estado text, fuentes integer, fuentes_listas integer,
  total numeric, adelanto numeric, debe numeric, nombre text, contenido text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.blacknavidad_public_status(p_code);
$$;

revoke all on function public.lookup_order_status(text) from public, anon, authenticated;
grant execute on function public.lookup_order_status(text) to anon, authenticated;
notify pgrst, 'reload schema';

commit;
