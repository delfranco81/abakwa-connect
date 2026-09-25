begin;

-- Business owners may view employees belonging only to businesses they own.
drop policy if exists "Business owners can view their employees"
on public.employees;

create policy "Business owners can view their employees"
on public.employees
for select
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.id = employees.business_id
      and business.owner_id = auth.uid()
  )
);

-- Business owners may add employees only to businesses they own.
drop policy if exists "Business owners can create their employees"
on public.employees;

create policy "Business owners can create their employees"
on public.employees
for insert
to authenticated
with check (
  exists (
    select 1
    from public.business
    where business.id = employees.business_id
      and business.owner_id = auth.uid()
  )
);

-- Business owners may update employees belonging only to businesses they own.
drop policy if exists "Business owners can update their employees"
on public.employees;

create policy "Business owners can update their employees"
on public.employees
for update
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.id = employees.business_id
      and business.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business
    where business.id = employees.business_id
      and business.owner_id = auth.uid()
  )
);

-- Business owners may remove employees belonging only to businesses they own.
drop policy if exists "Business owners can delete their employees"
on public.employees;

create policy "Business owners can delete their employees"
on public.employees
for delete
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.id = employees.business_id
      and business.owner_id = auth.uid()
  )
);

commit;
