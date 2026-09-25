begin;

-- Allow an authenticated owner to update only their own business row.
drop policy if exists "Business owners can update their business"
on public.business;

create policy "Business owners can update their business"
on public.business
for update
to authenticated
using (
  owner_id = auth.uid()
)
with check (
  owner_id = auth.uid()
);

-- Allow an authenticated business owner to update only the public
-- place linked to a business that they own.
drop policy if exists "Business owners can update their business place"
on public.places;

create policy "Business owners can update their business place"
on public.places
for update
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.place_id = places.id
      and business.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business
    where business.place_id = places.id
      and business.owner_id = auth.uid()
  )
);

commit;
