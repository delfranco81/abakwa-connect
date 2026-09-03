-- ECOS server-authoritative payment activation.
--
-- This function is intentionally callable only by service_role.
-- It must only be invoked after a trusted payment-provider verification
-- has established that the payment actually succeeded.

create or replace function public.activate_verified_payment_transaction(
  p_transaction_id uuid,
  p_provider_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transaction public.payment_transactions%rowtype;
  v_subscription public.agency_subscriptions%rowtype;
  v_started_at timestamptz;
  v_expires_at timestamptz;
  v_provider_reference text;
  v_entitlement_id uuid;
begin
  if p_transaction_id is null then
    raise exception 'transaction_id is required';
  end if;

  v_provider_reference :=
    nullif(trim(coalesce(p_provider_reference, '')), '');

  /*
   * Lock the payment transaction so concurrent trusted activation
   * requests cannot process the same payment simultaneously.
   */
  select *
  into v_transaction
  from public.payment_transactions
  where id = p_transaction_id
  for update;

  if not found then
    raise exception 'Payment transaction was not found';
  end if;

  /*
   * Idempotency and recovery:
   *
   * A payment already marked verified is authoritative. Do not require
   * a new provider reference. Ensure its subscription entitlement exists
   * and return the current state.
   */
  if v_transaction.status = 'verified' then

    if v_transaction.subscription_id is null then
      raise exception
        'Verified payment transaction has no subscription';
    end if;

    select *
    into v_subscription
    from public.agency_subscriptions
    where id = v_transaction.subscription_id
    for update;

    if not found then
      raise exception
        'Subscription for verified payment was not found';
    end if;

    select id
    into v_entitlement_id
    from public.ecos_entitlements
    where subscription_id = v_transaction.subscription_id
      and capability_id = 'ecos.business.subscription'
      and subject_type = 'business'
      and subject_id = v_transaction.business_id
      and source = 'subscription'
    limit 1;

    if v_entitlement_id is null then
      insert into public.ecos_entitlements (
        capability_id,
        subject_type,
        subject_id,
        business_id,
        subscription_id,
        category_slug,
        source,
        status,
        starts_at,
        expires_at,
        metadata
      )
      values (
        'ecos.business.subscription',
        'business',
        v_transaction.business_id,
        v_transaction.business_id,
        v_transaction.subscription_id,
        null,
        'subscription',
        'active',
        coalesce(
          v_subscription.started_at,
          v_transaction.verified_at,
          now()
        ),
        v_subscription.expires_at,
        jsonb_build_object(
          'activation', 'payment_verification_recovery',
          'paymentTransactionId', v_transaction.id,
          'providerReference', v_transaction.provider_reference
        )
      )
      on conflict (
        subscription_id,
        capability_id,
        subject_type,
        subject_id
      )
      where source = 'subscription'
        and subscription_id is not null
      do update
      set
        status = 'active',
        expires_at = excluded.expires_at,
        metadata = excluded.metadata,
        updated_at = now()
      returning id into v_entitlement_id;
    end if;

    return jsonb_build_object(
      'success', true,
      'status', 'already_verified',
      'transactionId', v_transaction.id,
      'subscriptionId', v_transaction.subscription_id,
      'businessId', v_transaction.business_id,
      'entitlementId', v_entitlement_id,
      'providerReference', v_transaction.provider_reference
    );
  end if;

  /*
   * A first-time activation requires a trusted provider reference.
   */
  if v_provider_reference is null then
    raise exception 'provider_reference is required';
  end if;

  /*
   * A payment in a terminal negative state cannot be activated.
   */
  if v_transaction.status in (
    'failed',
    'cancelled',
    'refunded',
    'disputed'
  ) then
    raise exception
      'Payment transaction cannot be activated from status: %',
      v_transaction.status;
  end if;

  if v_transaction.subscription_id is null then
    raise exception 'Payment transaction has no subscription';
  end if;

  /*
   * Lock the subscription so concurrent trusted activation requests
   * cannot modify the same subscription independently.
   */
  select *
  into v_subscription
  from public.agency_subscriptions
  where id = v_transaction.subscription_id
  for update;

  if not found then
    raise exception 'Subscription was not found';
  end if;

  /*
   * Payment and subscription must belong to the same business.
   */
  if v_subscription.business_id <> v_transaction.business_id then
    raise exception
      'Payment transaction and subscription business do not match';
  end if;

  /*
   * Payment amount must equal the authoritative subscription amount.
   */
  if v_transaction.amount <> v_subscription.amount then
    raise exception
      'Payment amount does not match subscription amount';
  end if;

  /*
   * Payment method must match the subscription when already supplied.
   */
  if v_subscription.payment_method is not null
     and v_subscription.payment_method <> v_transaction.payment_method then
    raise exception
      'Payment method does not match subscription';
  end if;

  /*
   * First-time activation is allowed only from pending.
   */
  if v_subscription.status <> 'pending' then
    raise exception
      'Subscription cannot be activated from status: %',
      v_subscription.status;
  end if;

  v_started_at := now();

  if v_subscription.plan = 'monthly' then
    v_expires_at := v_started_at + interval '1 month';
  elsif v_subscription.plan = 'yearly' then
    v_expires_at := v_started_at + interval '1 year';
  else
    raise exception
      'Unsupported subscription plan: %',
      v_subscription.plan;
  end if;

  /*
   * Activate subscription using server-controlled values.
   */
  update public.agency_subscriptions
  set
    status = 'active',
    started_at = v_started_at,
    expires_at = v_expires_at,
    start_date = v_started_at::date,
    end_date = v_expires_at::date,
    payment_reference = v_provider_reference,
    payment_method = v_transaction.payment_method,
    updated_at = now()
  where id = v_subscription.id;

  /*
   * Mark payment verified.
   */
  update public.payment_transactions
  set
    provider_reference = v_provider_reference,
    status = 'verified',
    payment_received_at = coalesce(payment_received_at, now()),
    verified_at = now(),
    updated_at = now()
  where id = v_transaction.id;

  /*
   * Create or update the authoritative business subscription entitlement.
   */
  insert into public.ecos_entitlements (
    capability_id,
    subject_type,
    subject_id,
    business_id,
    subscription_id,
    category_slug,
    source,
    status,
    starts_at,
    expires_at,
    metadata
  )
  values (
    'ecos.business.subscription',
    'business',
    v_transaction.business_id,
    v_transaction.business_id,
    v_subscription.id,
    null,
    'subscription',
    'active',
    v_started_at,
    v_expires_at,
    jsonb_build_object(
      'activation', 'payment_verification',
      'paymentTransactionId', v_transaction.id,
      'providerReference', v_provider_reference
    )
  )
  on conflict (
    subscription_id,
    capability_id,
    subject_type,
    subject_id
  )
  where source = 'subscription'
    and subscription_id is not null
  do update
  set
    status = 'active',
    starts_at = excluded.starts_at,
    expires_at = excluded.expires_at,
    metadata = excluded.metadata,
    updated_at = now()
  returning id into v_entitlement_id;

  return jsonb_build_object(
    'success', true,
    'status', 'activated',
    'transactionId', v_transaction.id,
    'subscriptionId', v_subscription.id,
    'businessId', v_transaction.business_id,
    'entitlementId', v_entitlement_id,
    'providerReference', v_provider_reference,
    'startedAt', v_started_at,
    'expiresAt', v_expires_at
  );
end;
$$;

revoke execute
on function public.activate_verified_payment_transaction(uuid, text)
from public, anon, authenticated;

grant execute
on function public.activate_verified_payment_transaction(uuid, text)
to service_role;
