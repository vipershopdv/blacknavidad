begin;

create function private.blacknavidad_next_order_code()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (auth.jwt() -> 'app_metadata' -> 'blacknavidad_admin') is distinct from 'true'::jsonb then
    raise insufficient_privilege using message = 'BlackNavidad admin access required';
  end if;

  -- The identity sequence uses the default increment and cache of one.
  return (
    select 'C-' || (last_value + case when is_called then 1 else 0 end)::text
    from public.clients_code_number_seq
  );
end;
$$;

revoke all on function private.blacknavidad_next_order_code() from public, anon, authenticated;
grant execute on function private.blacknavidad_next_order_code() to authenticated;

create function public.admin_next_order_code()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select private.blacknavidad_next_order_code();
$$;

revoke all on function public.admin_next_order_code() from public, anon, authenticated;
grant execute on function public.admin_next_order_code() to authenticated;

commit;
