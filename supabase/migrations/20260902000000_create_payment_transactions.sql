create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null,
  business_id uuid not null,
  subscription_id uuid null,

  verified_email text not null,

  amount integer not null check (amount > 0),
  currency text not null default 'XAF',

  payment_method text not null
    check (payment_method in ('mtn', 'orange')),

  provider_reference text null,

  status text not null default 'initiated'
    check (
      status in (
        'initiated',
        'payment_pending',
        'payment_received',
        'provider_verification_pending',
        'verified',
        'failed',
        'cancelled',
        'under_review',
        'refunded',
        'disputed'
      )
    ),

  initiated_at timestamptz not null default now(),
  payment_received_at timestamptz null,
  verified_at timestamptz null,
  failed_at timestamptz null,
  cancelled_at timestamptz null,

  metadata jsonb null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint payment_transactions_business_id_fkey
    foreign key (business_id)
    references public.business(id)
    on delete restrict,

  constraint payment_transactions_subscription_id_fkey
    foreign key (subscription_id)
    references public.agency_subscriptions(id)
    on delete set null
);

create index if not exists payment_transactions_user_id_idx
  on public.payment_transactions(user_id);

create index if not exists payment_transactions_business_id_idx
  on public.payment_transactions(business_id);

create index if not exists payment_transactions_subscription_id_idx
  on public.payment_transactions(subscription_id);

create index if not exists payment_transactions_provider_reference_idx
  on public.payment_transactions(provider_reference);

create index if not exists payment_transactions_status_idx
  on public.payment_transactions(status);

create index if not exists payment_transactions_created_at_idx
  on public.payment_transactions(created_at desc);

create or replace function public.set_payment_transactions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payment_transactions_set_updated_at
  on public.payment_transactions;

create trigger payment_transactions_set_updated_at
before update on public.payment_transactions
for each row
execute function public.set_payment_transactions_updated_at();

alter table public.payment_transactions enable row level security;

drop policy if exists "Users can view their payment transactions"
  on public.payment_transactions;

create policy "Users can view their payment transactions"
on public.payment_transactions
for select
to authenticated
using (
  user_id = auth.uid()
);

drop policy if exists "Users can create their payment transactions"
  on public.payment_transactions;

create policy "Users can create their payment transactions"
on public.payment_transactions
for insert
to authenticated
with check (
  user_id = auth.uid()
);

drop policy if exists "Users cannot update payment transactions"
  on public.payment_transactions;

create policy "Users cannot update payment transactions"
on public.payment_transactions
for update
to authenticated
using (false)
with check (false);

drop policy if exists "Users cannot delete payment transactions"
  on public.payment_transactions;

create policy "Users cannot delete payment transactions"
on public.payment_transactions
for delete
to authenticated
using (false);
