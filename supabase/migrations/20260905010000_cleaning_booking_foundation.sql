begin;

alter table public.bookings
  add column if not exists cleaning_category text,
  add column if not exists cleaning_requirements text,
  add column if not exists service_details jsonb not null default '{}'::jsonb,
  add column if not exists customer_photos jsonb not null default '[]'::jsonb;

comment on column public.bookings.cleaning_category
  is 'ECOS Cleaning Services category for non-vehicle and vehicle cleaning bookings.';

comment on column public.bookings.cleaning_requirements
  is 'Customer description of exactly what needs to be cleaned.';

comment on column public.bookings.service_details
  is 'Structured service-specific details for the cleaning booking.';

comment on column public.bookings.customer_photos
  is 'References to customer-uploaded cleaning photos stored outside the bookings table.';

commit;
