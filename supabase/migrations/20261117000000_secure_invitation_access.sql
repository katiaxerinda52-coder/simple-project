-- Secure, incremental access-control upgrade for Massas de Noiva Pro.
-- Keeps existing recipes and authorized email rows. Does not seed an administrator.

begin;

create schema if not exists private;

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
alter table public.user_roles enable row level security;
revoke all on public.user_roles from public, anon, authenticated;

-- Remove old policies first because the original write policy references the legacy role column.
alter table public.authorized_users enable row level security;
drop policy if exists "Admins manage authorized users" on public.authorized_users;
drop policy if exists "Admin reads authorized users" on public.authorized_users;

-- Remove the old email-based role mechanism without deleting allowlist rows.
alter table public.authorized_users drop constraint if exists only_owner_can_be_admin;
alter table public.authorized_users drop column if exists role;

-- No client can read/write the allowlist directly. All operations use checked RPCs.
revoke all on public.authorized_users from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and exists (
       select 1
       from public.user_roles ur
       where ur.user_id = auth.uid()
         and ur.role = 'admin'
     );
$$;

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin();
$$;

create or replace function public.is_app_authorized()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and (
       public.is_admin()
       or exists (
         select 1
         from public.authorized_users au
         where au.email = lower(btrim(coalesce(auth.jwt()->>'email', '')))
           and au.active = true
       )
     );
$$;

create or replace function public.admin_list_authorized_users(p_search text default null)
returns table(email text, active boolean, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Acesso reservado à administradora.' using errcode = '42501';
  end if;

  return query
    select au.email, au.active, au.created_at
    from public.authorized_users au
    where p_search is null
       or au.email ilike '%' || lower(btrim(p_search)) || '%'
    order by au.email;
end;
$$;

create or replace function public.admin_add_authorized_user(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare clean_email text := lower(btrim(coalesce(p_email, '')));
begin
  if not public.is_admin() then
    raise exception 'Acesso reservado à administradora.' using errcode = '42501';
  end if;
  if clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Endereço de e-mail inválido.' using errcode = '22023';
  end if;
  insert into public.authorized_users(email, active)
  values (clean_email, true)
  on conflict (email) do update set active = true;
  return true;
end;
$$;

create or replace function public.admin_remove_authorized_user(p_email text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare clean_email text := lower(btrim(coalesce(p_email, '')));
begin
  if not public.is_admin() then
    raise exception 'Acesso reservado à administradora.' using errcode = '42501';
  end if;
  update public.authorized_users
     set active = false
   where email = clean_email;
  return found;
end;
$$;

-- Recipe access remains unchanged in purpose, but now depends on fresh server-side checks.
alter table public.wedding_cake_recipes enable row level security;
drop policy if exists "Authorized users read recipes" on public.wedding_cake_recipes;
drop policy if exists "Admins manage recipes" on public.wedding_cake_recipes;
create policy "Authorized users read recipes"
  on public.wedding_cake_recipes for select to authenticated
  using (public.is_app_authorized());
create policy "Admins manage recipes"
  on public.wedding_cake_recipes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_app_admin() from public, anon, authenticated;
revoke all on function public.is_app_authorized() from public, anon, authenticated;
revoke all on function public.admin_list_authorized_users(text) from public, anon, authenticated;
revoke all on function public.admin_add_authorized_user(text) from public, anon, authenticated;
revoke all on function public.admin_remove_authorized_user(text) from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_app_admin() to authenticated;
grant execute on function public.is_app_authorized() to authenticated;
grant execute on function public.admin_list_authorized_users(text) to authenticated;
grant execute on function public.admin_add_authorized_user(text) to authenticated;
grant execute on function public.admin_remove_authorized_user(text) to authenticated;

commit;
