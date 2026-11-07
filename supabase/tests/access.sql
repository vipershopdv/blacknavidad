-- Run only on a fresh, disposable database; identity sequences advance.
begin;
set local role authenticated;
select set_config('request.jwt.claims', '{"app_metadata":{"blacknavidad_admin":true}}', true);

do $$
begin
  if public.admin_next_order_code() is distinct from 'C-1'
     or public.admin_next_order_code() is distinct from 'C-1' then
    raise exception 'Preview should not consume a code';
  end if;
end;
$$;

insert into public.clients (nombre, contenido, whatsapp, fuentes, total, adelanto)
values ('Test', 'Test', '000000000', 3, 50, 15), ('Test 2', 'Test', '', 1, 25, 0);
do $$
begin
  if not exists (select 1 from public.clients where id = 'C-1' and debe = 35 and estado = 'espera')
     or not exists (select 1 from public.clients where id = 'C-2') then
    raise exception 'Incorrect initial orders';
  end if;
end;
$$;
update public.clients set fuentes_listas = 3, estado = 'listo' where id = 'C-1';

set local role anon;
do $$
declare
  result jsonb;
begin
  begin
    perform public.admin_next_order_code();
    raise exception 'Anonymous preview was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform nombre from public.clients;
    raise exception 'Anonymous table read was allowed';
  exception when insufficient_privilege then null;
  end;
  select to_jsonb(s) into strict result from public.lookup_order_status('C-1') s;
  if result <> '{"id":"C-1","estado":"listo","fuentes":3,"fuentes_listas":3,"total":50,"adelanto":15,"debe":35,"nombre":"Test","contenido":"Test"}'::jsonb then
    raise exception 'Unexpected public payload';
  end if;
  if to_regprocedure('public.lookup_order_payment(text,text)') is not null then
    raise exception 'Legacy private-code endpoint was not removed';
  end if;
  if exists (select 1 from public.lookup_order_status('C-999'))
     or exists (select 1 from public.lookup_order_status('%')) then
    raise exception 'Lookup matched a missing or invalid code';
  end if;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claims', '{"user_metadata":{"blacknavidad_admin":true}}', true);
do $$
begin
  if exists (select 1 from public.clients) then raise exception 'Non-admin read was allowed'; end if;
  begin
    perform public.admin_next_order_code();
    raise exception 'Non-admin preview was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.clients (nombre, contenido, fuentes, total, adelanto)
      values ('Test', 'Test', 1, 25, 0);
    raise exception 'Non-admin insert was allowed';
  exception when insufficient_privilege then null;
  end;
  delete from public.clients;
  if found then raise exception 'Non-admin delete was allowed'; end if;
end;
$$;

select set_config('request.jwt.claims', '{"app_metadata":{"blacknavidad_admin":true}}', true);
do $$
begin
  update public.clients set estado = 'entregado', adelanto = total where id = 'C-1';
  if not exists (select 1 from public.clients where id = 'C-1' and debe = 0) then
    raise exception 'Delivery did not settle the order';
  end if;
  delete from public.clients where id = 'C-2';
  if not found then raise exception 'Admin delete failed'; end if;
  -- The rejected insert consumed C-3 before the RLS check.
  if public.admin_next_order_code() is distinct from 'C-4' then
    raise exception 'Preview did not account for deleted and rejected orders';
  end if;
end;
$$;
rollback;
