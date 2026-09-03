-- Everyday Connect / ECOS
-- Business Payment Accounts + Customer Membership Foundation
--
-- Purpose:
--   1. Let each business configure its own customer-facing payment accounts.
--   2. Let each business define its own membership plans and benefits.
--   3. Let authenticated Everyday Connect users join a specific business.
--   4. Keep business membership separate from global user permissions.
--   5. Prepare membership payments for the existing payment_transactions engine.
--
-- Security principle:
--   Client applications may request actions, but server-side ownership,
--   pricing, payment-account selection and membership activation remain authoritative.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Business payment accounts
-- -----------------------------------------------------------------------------

create table if not exists public.ecos_business_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business(id) on delete cascade,
  provider text not null check (provider in ('mtn', 'orange', 'bank', 'other')),
  account_name text,
  account_identifier text not null,
  display_name text,
  is_enabled boolean not null default true,
  is_verified boolean not null default false,
  is_default boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, provider, account_identifier)
);

create index if not exists idx_ecos_business_payment_accounts_business
  on public.ecos_business_payment_accounts (business_id);

create index if not exists idx_ecos_business_payment_accounts_provider
  on public.ecos_business_payment_accounts (provider);

create unique index if not exists uq_ecos_business_default_payment_account
  on public.ecos_business_payment_accounts (business_id)
  where is_default = true and is_enabled = true;

-- -----------------------------------------------------------------------------
-- Membership plans defined by each business
-- -----------------------------------------------------------------------------

create table if not exists public.ecos_business_membership_plans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business(id) on delete cascade,
  name text not null,
  description text,
  billing_type text not null default 'monthly'
    check (billing_type in ('free', 'monthly', 'yearly', 'one_time', 'invite_only')),
  amount integer not null default 0 check (amount >= 0),
  currency text not null default 'XAF' check (currency = 'XAF'),
  active boolean not null default true,
  approval_required boolean not null default false,
  benefits jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ecos_business_membership_plans_business
  on public.ecos_business_membership_plans (business_id);

create index if not exists idx_ecos_business_membership_plans_active
  on public.ecos_business_membership_plans (business_id, active, sort_order);

-- -----------------------------------------------------------------------------
-- Customer membership relationship
-- -----------------------------------------------------------------------------

create table if not exists public.ecos_business_memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  membership_plan_id uuid not null references public.ecos_business_membership_plans(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'expired', 'cancelled', 'suspended', 'rejected')),
  payment_transaction_id uuid references public.payment_transactions(id) on delete set null,
  started_at timestamptz,
  expires_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ecos_business_memberships_business
  on public.ecos_business_memberships (business_id);

create index if not exists idx_ecos_business_memberships_customer
  on public.ecos_business_memberships (customer_id);

create index if not exists idx_ecos_business_memberships_status
  on public.ecos_business_memberships (status);

create index if not exists idx_ecos_business_memberships_payment
  on public.ecos_business_memberships (payment_transaction_id);

create unique index if not exists uq_ecos_active_customer_business_membership
  on public.ecos_business_memberships (business_id, customer_id)
  where status in ('pending', 'active');

-- -----------------------------------------------------------------------------
-- Link payment transactions to a business payment account and membership
-- -----------------------------------------------------------------------------

alter table public.payment_transactions
  add column if not exists business_payment_account_id uuid;

alter table public.payment_transactions
  add column if not exists membership_id uuid;

alter table public.payment_transactions
  add constraint payment_transactions_business_payment_account_fk
  foreign key (business_payment_account_id)
  references public.ecos_business_payment_accounts(id)
  on delete set null;

alter table public.payment_transactions
  add constraint payment_transactions_membership_fk
  foreign key (membership_id)
  references public.ecos_business_memberships(id)
  on delete set null;

create index if not exists idx_payment_transactions_business_payment_account
  on public.payment_transactions (business_payment_account_id);

create index if not exists idx_payment_transactions_membership
  on public.payment_transactions (membership_id);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.ecos_business_payment_accounts enable row level security;
alter table public.ecos_business_membership_plans enable row level security;
alter table public.ecos_business_memberships enable row level security;

-- Remove policies if this migration is safely re-run.
drop policy if exists "business owners manage payment accounts" on public.ecos_business_payment_accounts;
drop policy if exists "customers view enabled payment accounts" on public.ecos_business_payment_accounts;
drop policy if exists "business owners manage membership plans" on public.ecos_business_membership_plans;
drop policy if exists "customers view active membership plans" on public.ecos_business_membership_plans;
drop policy if exists "customers view own memberships" on public.ecos_business_memberships;
drop policy if exists "business owners view memberships" on public.ecos_business_memberships;

-- Owners can manage only accounts belonging to businesses they own.
create policy "business owners manage payment accounts"
on public.ecos_business_payment_accounts
for all
to authenticated
using (
  exists (
    select 1
    from public.business b
    where b.id = ecos_business_payment_accounts.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business b
    where b.id = ecos_business_payment_accounts.business_id
      and b.owner_id = auth.uid()
  )
);

-- Customers may only see enabled/verified accounts needed to select a payment
-- method. Sensitive provider metadata must not be stored here.
create policy "customers view enabled payment accounts"
on public.ecos_business_payment_accounts
for select
to authenticated
using (is_enabled = true and is_verified = true);

create policy "business owners manage membership plans"
on public.ecos_business_membership_plans
for all
to authenticated
using (
  exists (
    select 1
    from public.business b
    where b.id = ecos_business_membership_plans.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.business b
    where b.id = ecos_business_membership_plans.business_id
      and b.owner_id = auth.uid()
  )
);

create policy "customers view active membership plans"
on public.ecos_business_membership_plans
for select
to authenticated
using (active = true and billing_type <> 'invite_only');

create policy "customers view own memberships"
on public.ecos_business_memberships
for select
to authenticated
using (customer_id = auth.uid());

create policy "business owners view memberships"
on public.ecos_business_memberships
for select
to authenticated
using (
  exists (
    select 1
    from public.business b
    where b.id = ecos_business_memberships.business_id
      and b.owner_id = auth.uid()
  )
);

-- No direct client INSERT/UPDATE/DELETE policy is intentionally provided for
-- memberships. Creation, payment linkage and activation will be server-side.

-- -----------------------------------------------------------------------------
-- Server-authoritative membership creation
-- -----------------------------------------------------------------------------

create or replace function public.create_pending_business_membership(
  p_business_id uuid,
  p_membership_plan_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_membership_id uuid;
  v_plan record;
  v_existing record;
begin
  if v_customer_id is null then
    raise exception 'Authentication required';
  end if;

  select *
    into v_plan
  from public.ecos_business_membership_plans
  where id = p_membership_plan_id
    and business_id = p_business_id
    and active = true;

  if not found then
    raise exception 'Membership plan is unavailable';
  end if;

  select *
    into v_existing
  from public.ecos_business_memberships
  where business_id = p_business_id
    and customer_id = v_customer_id
    and status in ('pending', 'active')
  limit 1;

  if found then
    raise exception 'Customer already has a pending or active membership for this business';
  end if;

  if v_plan.billing_type = 'invite_only' then
    raise exception 'This membership requires an invitation';
  end if;

  insert into public.ecos_business_memberships (
    business_id,
    customer_id,
    membership_plan_id,
    status,
    started_at,
    metadata
  )
  values (
    p_business_id,
    v_customer_id,
    p_membership_plan_id,
    case when v_plan.billing_type = 'free' or v_plan.amount = 0 then 'active' else 'pending' end,
    case when v_plan.billing_type = 'free' or v_plan.amount = 0 then now() else null end,
    jsonb_build_object('created_by', 'customer_request')
  )
  returning id into v_membership_id;

  return v_membership_id;
end;
$$;

revoke all on function public.create_pending_business_membership(uuid, uuid) from public;
revoke all on function public.create_pending_business_membership(uuid, uuid) from anon;
revoke all on function public.create_pending_business_membership(uuid, uuid) from authenticated;
grant execute on function public.create_pending_business_membership(uuid, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Updated-at helper
-- -----------------------------------------------------------------------------

create or replace function public.ecos_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ecos_business_payment_accounts_updated_at
  on public.ecos_business_payment_accounts;
create trigger trg_ecos_business_payment_accounts_updated_at
before update on public.ecos_business_payment_accounts
for each row execute function public.ecos_set_updated_at();

drop trigger if exists trg_ecos_business_membership_plans_updated_at
  on public.ecos_business_membership_plans;
create trigger trg_ecos_business_membership_plans_updated_at
before update on public.ecos_business_membership_plans
for each row execute function public.ecos_set_updated_at();

drop trigger if exists trg_ecos_business_memberships_updated_at
  on public.ecos_business_memberships;
create trigger trg_ecos_business_memberships_updated_at
before update on public.ecos_business_memberships
for each row execute function public.ecos_set_updated_at();

-- -----------------------------------------------------------------------------
-- Documentation comments
-- -----------------------------------------------------------------------------

comment on table public.ecos_business_payment_accounts is
  'Business-owned customer payment destinations used by the Everyday Connect payment engine.';

comment on table public.ecos_business_membership_plans is
  'Membership products defined and controlled by an individual business.';

comment on table public.ecos_business_memberships is
  'Scoped customer-to-business membership relationship; does not grant global platform permissions.';

comment on column public.payment_transactions.business_payment_account_id is
  'The business payment destination selected for a customer-facing transaction; server authoritative.';

comment on column public.payment_transactions.membership_id is
  'Optional customer membership relationship associated with this payment transaction.';
