-- ECOS entitlement persistence foundation.
-- Entitlements are authoritative server-side records describing
-- which capabilities a user or business is allowed to access.

create table if not exists public.ecos_entitlements (
  id uuid primary key default gen_random_uuid(),

  capability_id text not null,

  subject_type text not null
    check (subject_type in ('user', 'business')),

  subject_id uuid not null,

  business_id uuid null,

  subscription_id uuid null,

  category_slug text null,

  source text not null
    check (
      source in (
        'subscription',
        'promotion',
        'platform_grant',
        'business_grant',
        'system'
      )
    ),

  status text not null default 'active'
    check (
      status in (
        'active',
        'scheduled',
        'expired',
        'revoked'
      )
    ),

  starts_at timestamptz not null default now(),

  expires_at timestamptz null,

  metadata jsonb null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint ecos_entitlements_business_id_fkey
    foreign key (business_id)
    references public.business(id)
    on delete restrict,

  constraint ecos_entitlements_subscription_id_fkey
    foreign key (subscription_id)
    references public.agency_subscriptions(id)
    on delete set null
);

create index if not exists idx_ecos_entitlements_capability
  on public.ecos_entitlements(capability_id);

create index if not exists idx_ecos_entitlements_subject
  on public.ecos_entitlements(subject_type, subject_id);

create index if not exists idx_ecos_entitlements_business
  on public.ecos_entitlements(business_id);

create index if not exists idx_ecos_entitlements_subscription
  on public.ecos_entitlements(subscription_id);

create index if not exists idx_ecos_entitlements_status
  on public.ecos_entitlements(status);

create index if not exists idx_ecos_entitlements_expires_at
  on public.ecos_entitlements(expires_at);

create or replace function public.set_ecos_entitlements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ecos_entitlements_updated_at
  on public.ecos_entitlements;

create trigger set_ecos_entitlements_updated_at
before update on public.ecos_entitlements
for each row
execute function public.set_ecos_entitlements_updated_at();

alter table public.ecos_entitlements enable row level security;

drop policy if exists "Users can view their ECOS entitlements"
  on public.ecos_entitlements;

create policy "Users can view their ECOS entitlements"
on public.ecos_entitlements
for select
to authenticated
using (
  subject_type = 'user'
  and subject_id = auth.uid()
);

revoke insert, update, delete
  on public.ecos_entitlements
  from authenticated;

grant select
  on public.ecos_entitlements
  to authenticated;
