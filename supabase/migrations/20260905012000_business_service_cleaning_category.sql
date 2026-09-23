begin;

alter table public.business_services
  add column if not exists cleaning_category text;

alter table public.business_services
  drop constraint if exists business_services_cleaning_category_check;

alter table public.business_services
  add constraint business_services_cleaning_category_check
  check (
    cleaning_category is null
    or cleaning_category in (
      'car-wash',
      'vehicle-detailing',
      'home-cleaning',
      'hotel-cleaning',
      'office-cleaning',
      'laundry',
      'carpet-cleaning',
      'general-cleaning',
      'other-cleaning'
    )
  );

comment on column public.business_services.cleaning_category
  is 'ECOS Cleaning Services category. Null means the service is not a Cleaning Services offering.';

commit;
