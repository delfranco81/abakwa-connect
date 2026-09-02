-- Harden payment transaction access.
-- Payment transactions must be created and changed only by trusted
-- server-side payment/verification flows.

drop policy if exists "Users can create their payment transactions"
  on public.payment_transactions;

revoke insert, update, delete
  on public.payment_transactions
  from authenticated;

grant select
  on public.payment_transactions
  to authenticated;
