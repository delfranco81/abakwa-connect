-- Prevent duplicate subscription-backed entitlements.
--
-- One subscription may provide one instance of a given capability
-- to a given subject.

create unique index if not exists
  uq_ecos_entitlements_subscription_capability_subject
on public.ecos_entitlements (
  subscription_id,
  capability_id,
  subject_type,
  subject_id
)
where source = 'subscription'
  and subscription_id is not null;
