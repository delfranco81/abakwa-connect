-- Launch hardening:
-- Preserve the verified owner permissions required for
-- business service management and booking management.

-- ============================================================
-- BUSINESS SERVICES
-- business_services.business_id references places.id.
-- Ownership is resolved through business.place_id.
-- ============================================================

drop policy if exists "Business owners can create their services"
on public.business_services;

create policy "Business owners can create their services"
on public.business_services
for insert
to authenticated
with check (
  exists (
    select 1
    from public.business
    where business.place_id = business_services.business_id
      and business.owner_id = auth.uid()
  )
);

drop policy if exists "Business owners can update their services"
on public.business_services;

create policy "Business owners can update their services"
on public.business_services
for update
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.place_id = business_services.business_id
      and business.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business
    where business.place_id = business_services.business_id
      and business.owner_id = auth.uid()
  )
);

drop policy if exists "Business owners can delete their services"
on public.business_services;

create policy "Business owners can delete their services"
on public.business_services
for delete
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.place_id = business_services.business_id
      and business.owner_id = auth.uid()
  )
);

-- ============================================================
-- BOOKINGS
-- bookings.business_id references business.id.
-- ============================================================

drop policy if exists "Business owners can view their bookings"
on public.bookings;

create policy "Business owners can view their bookings"
on public.bookings
for select
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.id = bookings.business_id
      and business.owner_id = auth.uid()
  )
);

drop policy if exists "Business owners can update their bookings"
on public.bookings;

create policy "Business owners can update their bookings"
on public.bookings
for update
to authenticated
using (
  exists (
    select 1
    from public.business
    where business.id = bookings.business_id
      and business.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business
    where business.id = bookings.business_id
      and business.owner_id = auth.uid()
  )
);
