-- Secure membership payment transaction creation
-- Everyday Connect / ECOS
--
-- This function creates a payment transaction for a pending
-- business membership. Financial values and business ownership
-- are resolved server-side.

create or replace function public.create_business_membership_payment_transaction(
  p_membership_id uuid,
  p_business_payment_account_id uuid,
  p_payment_method text,
  p_customer_phone_number text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_customer_id uuid := auth.uid();
  v_membership record;
  v_plan record;
  v_payment_account record;
  v_transaction_id uuid;
begin
  if v_customer_id is null then
    raise exception 'Authentication required';
  end if;

  if p_membership_id is null then
    raise exception 'Membership ID is required';
  end if;

  if p_business_payment_account_id is null then
    raise exception 'Business payment account is required';
  end if;

  if p_payment_method not in ('mtn', 'orange') then
    raise exception 'Unsupported payment method';
  end if;

  if p_customer_phone_number is null
     or length(trim(p_customer_phone_number)) < 6 then
    raise exception 'A valid customer phone number is required';
  end if;

  /*
   * SECURITY CHECK 1
   *
   * Resolve the membership through the authenticated customer.
   */
  select *
    into v_membership
  from public.ecos_business_memberships
  where id = p_membership_id
    and customer_id = v_customer_id
    and status = 'pending';

  if not found then
    raise exception 'Pending membership was not found';
  end if;

  /*
   * SECURITY CHECK 2
   *
   * Resolve the membership plan from the database.
   */
  select *
    into v_plan
  from public.ecos_business_membership_plans
  where id = v_membership.membership_plan_id
    and business_id = v_membership.business_id
    and active = true;

  if not found then
    raise exception 'Membership plan is unavailable';
  end if;

  if v_plan.billing_type = 'free'
     or v_plan.amount = 0 then
    raise exception 'This membership does not require payment';
  end if;

  /*
   * SECURITY CHECK 3
   *
   * Resolve the business payment account.
   *
   * Only enabled and verified accounts may receive
   * customer membership payments.
   */
  select *
    into v_payment_account
  from public.ecos_business_payment_accounts
  where id = p_business_payment_account_id
    and business_id = v_membership.business_id
    and is_enabled = true
    and is_verified = true;

  if not found then
    raise exception 'Business payment account is unavailable';
  end if;

  /*
   * The payment method selected by the customer must correspond
   * to the configured business payment provider.
   */
  if v_payment_account.provider <> p_payment_method then
    raise exception 'Selected payment method does not match the business payment account';
  end if;

  /*
   * Prevent multiple active payment transactions for the same
   * pending membership.
   */
  if exists (
    select 1
    from public.payment_transactions
    where membership_id = v_membership.id
      and status in (
        'initiated',
        'payment_pending',
        'payment_received',
        'funds_held',
        'provider_validated'
      )
  ) then
    raise exception 'A payment transaction already exists for this membership';
  end if;

  /*
   * CREATE PAYMENT TRANSACTION
   *
   * Amount comes from the authoritative membership plan.
   * Business and customer identity come from the membership.
   * Recipient comes from the verified business payment account.
   */
  insert into public.payment_transactions (
    user_id,
    business_id,
    subscription_id,
    membership_id,
    business_payment_account_id,
    verified_email,
    amount,
    currency,
    payment_method,
    provider_reference,
    status,
    initiated_at,
    metadata
  )
  values (
    v_customer_id,
    v_membership.business_id,
    null,
    v_membership.id,
    v_payment_account.id,
    (
      select email
      from auth.users
      where id = v_customer_id
    ),
    v_plan.amount,
    v_plan.currency,
    p_payment_method,
    null,
    'initiated',
    now(),
    jsonb_build_object(
      'transaction_type', 'business_membership',
      'membership_id', v_membership.id,
      'membership_plan_id', v_plan.id,
      'membership_plan_name', v_plan.name,
      'business_payment_account_id', v_payment_account.id,
      'business_payment_provider', v_payment_account.provider,
      'business_payment_account_display_name', v_payment_account.display_name,
      'customer_phone_number', trim(p_customer_phone_number)
    )
  )
  returning id into v_transaction_id;

  return v_transaction_id;
end;
$function$;

revoke execute
on function public.create_business_membership_payment_transaction(
  uuid,
  uuid,
  text,
  text
)
from public;

revoke execute
on function public.create_business_membership_payment_transaction(
  uuid,
  uuid,
  text,
  text
)
from anon;

grant execute
on function public.create_business_membership_payment_transaction(
  uuid,
  uuid,
  text,
  text
)
to authenticated;
