-- Everyday Connect: category-aware, database-driven subscription catalog.
-- Prices/features are intentionally data, not application constants, so they can be changed later.

create table if not exists public.ecos_subscription_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecos_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references public.ecos_subscription_categories(slug) on update cascade,
  plan_code text not null,
  name text not null,
  description text,
  monthly_amount integer not null check (monthly_amount > 0),
  yearly_amount integer not null check (yearly_amount > 0),
  currency text not null default 'XAF',
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_slug, plan_code)
);

create table if not exists public.ecos_subscription_category_aliases (
  alias text primary key,
  category_slug text not null references public.ecos_subscription_categories(slug) on update cascade
);

alter table public.agency_subscriptions
  add column if not exists category_slug text,
  add column if not exists plan_code text,
  add column if not exists plan_id uuid;

create index if not exists idx_agency_subscriptions_business_status
  on public.agency_subscriptions (business_id, status, created_at desc);

create index if not exists idx_agency_subscriptions_category_plan
  on public.agency_subscriptions (category_slug, plan_code);

create index if not exists idx_ecos_subscription_plans_category_active
  on public.ecos_subscription_plans (category_slug, active, sort_order);

-- Categories currently supported by the ECOS direction, plus common platform categories.
insert into public.ecos_subscription_categories (slug, name, description)
values
 ('car-wash', 'Car Wash', 'Vehicle washing, detailing and related services'),
 ('hotel', 'Hotel & Accommodation', 'Hotels, guest houses and accommodation providers'),
 ('tourism', 'Tourism', 'Tour operators, attractions, guides and travel experiences'),
 ('talent', 'Talent & Skilled Services', 'Independent professionals and skilled service providers'),
 ('construction', 'Construction', 'Construction, building and contracting businesses'),
 ('real-estate', 'Real Estate', 'Property sales, rentals and property services'),
 ('healthcare', 'Healthcare', 'Clinics, pharmacies, wellness and healthcare services'),
 ('events', 'Events', 'Event planners, venues and event service providers'),
 ('leisure', 'Leisure & Recreation', 'Entertainment, recreation and leisure businesses'),
 ('food-delivery', 'Food Delivery', 'Food ordering, delivery and related services'),
 ('technology', 'Technology', 'Technology, software and digital service businesses'),
 ('community', 'Community', 'Community-oriented organizations and services'),
 ('ideas-innovation', 'Ideas & Innovation', 'Innovation, projects and emerging ventures'),
 ('education', 'Education', 'Schools, tutors, training and learning providers'),
 ('transport', 'Transport', 'Transport, logistics and mobility services'),
 ('agriculture', 'Agriculture', 'Farms, agricultural services and agribusinesses'),
 ('beauty', 'Beauty & Personal Care', 'Beauty salons, barbers and personal care providers'),
 ('retail', 'Retail & Shopping', 'Retail shops, sellers and product businesses'),
 ('professional-services', 'Professional Services', 'General professional and business services'),
 ('general-business', 'General Business', 'Fallback plan family for newly introduced categories')
on conflict (slug) do update set name = excluded.name, description = excluded.description, active = true, updated_at = now();

-- Raw category aliases are editable data. Add new aliases here without changing application logic.
insert into public.ecos_subscription_category_aliases (alias, category_slug)
values
 ('car wash', 'car-wash'), ('carwash', 'car-wash'), ('car-washes', 'car-wash'),
 ('hotel', 'hotel'), ('hotels', 'hotel'), ('guest house', 'hotel'), ('guesthouse', 'hotel'), ('accommodation', 'hotel'),
 ('tourism', 'tourism'), ('tourist', 'tourism'), ('tour operator', 'tourism'), ('travel', 'tourism'),
 ('talent', 'talent'), ('talents', 'talent'), ('carpenter', 'talent'), ('plumber', 'talent'), ('electrician', 'talent'), ('artisan', 'talent'),
 ('construction', 'construction'), ('contractor', 'construction'), ('building', 'construction'),
 ('real estate', 'real-estate'), ('real-estate', 'real-estate'), ('property', 'real-estate'),
 ('healthcare', 'healthcare'), ('health care', 'healthcare'), ('clinic', 'healthcare'), ('pharmacy', 'healthcare'),
 ('events', 'events'), ('event', 'events'), ('event planning', 'events'),
 ('leisure', 'leisure'), ('recreation', 'leisure'), ('entertainment', 'leisure'),
 ('food delivery', 'food-delivery'), ('food-delivery', 'food-delivery'), ('food', 'food-delivery'),
 ('technology', 'technology'), ('tech', 'technology'), ('software', 'technology'),
 ('community', 'community'),
 ('ideas', 'ideas-innovation'), ('innovation', 'ideas-innovation'), ('ideas and innovation', 'ideas-innovation'),
 ('education', 'education'), ('school', 'education'), ('training', 'education'),
 ('transport', 'transport'), ('logistics', 'transport'),
 ('agriculture', 'agriculture'), ('farming', 'agriculture'),
 ('beauty', 'beauty'), ('salon', 'beauty'), ('barber', 'beauty'),
 ('retail', 'retail'), ('shopping', 'retail'),
 ('professional services', 'professional-services'), ('professional-services', 'professional-services')
on conflict (alias) do update set category_slug = excluded.category_slug;

-- Proposed commercial plans. All values are XAF and are editable in this table later.
-- Yearly pricing follows the previously agreed proposed tariff where applicable.
insert into public.ecos_subscription_plans
(category_slug, plan_code, name, description, monthly_amount, yearly_amount, features, sort_order)
values
('car-wash','starter','Starter','Essential tools for a small car wash.',3000,32400,'["Business profile","Service catalogue","Customer enquiries","Basic dashboard"]',1),
('car-wash','professional','Professional','Management tools for a growing car wash.',5000,54000,'["Everything in Starter","Staff management","Bookings and customer records","Reviews management","Basic analytics","Promotions"]',2),
('car-wash','business','Business','Full operating toolkit for an established car wash.',8000,86400,'["Everything in Professional","Advanced analytics","Multiple staff roles","Marketing tools","Priority business visibility","Growth tools"]',3),

('hotel','starter','Starter','Essential tools for a small accommodation provider.',5000,54000,'["Business profile","Room/service catalogue","Customer enquiries","Basic dashboard"]',1),
('hotel','professional','Professional','Management tools for a growing hotel.',10000,108000,'["Everything in Starter","Room management","Reservation management","Guest records","Reviews management","Analytics"]',2),
('hotel','business','Business','Full management toolkit for an established hotel.',20000,216000,'["Everything in Professional","Advanced analytics","Staff operations","Promotions","Priority visibility","Growth tools"]',3),

('tourism','starter','Starter','Essential tools for independent tourism providers.',3000,32400,'["Business profile","Tours/services catalogue","Customer enquiries","Basic dashboard"]',1),
('tourism','professional','Professional','Management tools for growing tourism operators.',7500,81000,'["Everything in Starter","Tour and itinerary management","Guide/team management","Reviews","Analytics","Promotions"]',2),
('tourism','business','Business','Full growth toolkit for established tourism operators.',15000,162000,'["Everything in Professional","Advanced analytics","Multiple teams","Marketing tools","Priority visibility","Growth tools"]',3),

('talent','starter','Starter','Essential tools for independent skilled professionals.',2000,21600,'["Professional profile","Portfolio/services","Customer enquiries","Basic dashboard"]',1),
('talent','professional','Professional','Tools for professionals handling regular client work.',4000,43200,'["Everything in Starter","Project requests","Quotes","Availability","Reviews","Analytics"]',2),
('talent','business','Business','Full growth toolkit for high-volume skilled professionals.',7500,81000,'["Everything in Professional","Advanced analytics","Marketing tools","Priority visibility","Client growth tools","Team support"]',3),

('construction','starter','Starter','Essential tools for independent contractors and small builders.',4000,43200,'["Business profile","Services","Customer enquiries","Basic dashboard"]',1),
('construction','professional','Professional','Tools for active construction businesses.',8000,86400,'["Everything in Starter","Project enquiries","Team management","Quotes","Reviews","Analytics"]',2),
('construction','business','Business','Full operating and growth toolkit for construction firms.',15000,162000,'["Everything in Professional","Advanced analytics","Marketing tools","Multiple teams","Priority visibility","Growth tools"]',3),

('real-estate','starter','Starter','Essential tools for property professionals.',5000,54000,'["Business profile","Property listings","Customer enquiries","Basic dashboard"]',1),
('real-estate','professional','Professional','Tools for active property businesses.',10000,108000,'["Everything in Starter","Property management","Lead tracking","Reviews","Analytics","Promotions"]',2),
('real-estate','business','Business','Full growth toolkit for established property businesses.',20000,216000,'["Everything in Professional","Advanced analytics","Team roles","Marketing tools","Priority visibility","Growth tools"]',3),

('healthcare','starter','Starter','Essential tools for small healthcare providers.',5000,54000,'["Business profile","Services","Customer enquiries","Basic dashboard"]',1),
('healthcare','professional','Professional','Management tools for growing healthcare providers.',10000,108000,'["Everything in Starter","Service management","Staff management","Appointments/enquiries","Reviews","Analytics"]',2),
('healthcare','business','Business','Full growth toolkit for established healthcare organizations.',20000,216000,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility","Growth tools"]',3),

('events','starter','Starter','Essential tools for event professionals.',3000,32400,'["Business profile","Services/venue catalogue","Customer enquiries","Basic dashboard"]',1),
('events','professional','Professional','Tools for active event businesses.',7000,75600,'["Everything in Starter","Event/project management","Team management","Reviews","Analytics","Promotions"]',2),
('events','business','Business','Full growth toolkit for established event businesses.',14000,151200,'["Everything in Professional","Advanced analytics","Multiple teams","Marketing tools","Priority visibility","Growth tools"]',3),

('leisure','starter','Starter','Essential tools for leisure and recreation providers.',3000,32400,'["Business profile","Services","Customer enquiries","Basic dashboard"]',1),
('leisure','professional','Professional','Tools for growing leisure businesses.',7000,75600,'["Everything in Starter","Bookings/enquiries","Staff management","Reviews","Analytics","Promotions"]',2),
('leisure','business','Business','Full growth toolkit for established leisure businesses.',14000,151200,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility","Growth tools"]',3),

('food-delivery','starter','Starter','Essential tools for small food businesses.',3000,32400,'["Business profile","Menu/service catalogue","Customer enquiries","Basic dashboard"]',1),
('food-delivery','professional','Professional','Management tools for growing food businesses.',6000,64800,'["Everything in Starter","Order workflow","Staff management","Reviews","Analytics","Promotions"]',2),
('food-delivery','business','Business','Full operating and growth toolkit for established food businesses.',12000,129600,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility","Growth tools"]',3),

('technology','starter','Starter','Essential tools for independent technology businesses.',3000,32400,'["Business profile","Service catalogue","Customer enquiries","Basic dashboard"]',1),
('technology','professional','Professional','Tools for growing technology businesses.',7000,75600,'["Everything in Starter","Lead/project enquiries","Team management","Reviews","Analytics","Promotions"]',2),
('technology','business','Business','Full growth toolkit for established technology businesses.',15000,162000,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility","Growth tools"]',3),

('community','starter','Starter','Essential tools for community organizations and services.',1000,10800,'["Community profile","Community information","Basic dashboard"]',1),
('community','professional','Professional','Extended tools for community organizations.',3000,32400,'["Everything in Starter","Member/service management","Announcements","Analytics","Visibility tools"]',2),
('community','business','Business','Advanced tools for larger community organizations.',7000,75600,'["Everything in Professional","Advanced analytics","Multiple roles","Growth and outreach tools","Priority visibility"]',3),

('ideas-innovation','starter','Starter','Essential tools for ideas and early-stage projects.',2000,21600,'["Project profile","Idea showcase","Enquiries","Basic dashboard"]',1),
('ideas-innovation','professional','Professional','Tools for developing and promoting innovation projects.',5000,54000,'["Everything in Starter","Project management","Collaboration","Analytics","Promotion tools"]',2),
('ideas-innovation','business','Business','Advanced toolkit for established innovation ventures.',10000,108000,'["Everything in Professional","Advanced analytics","Team roles","Marketing tools","Priority visibility"]',3),

('education','starter','Starter','Essential tools for independent educators and small learning providers.',2500,27000,'["Education profile","Courses/services","Enquiries","Basic dashboard"]',1),
('education','professional','Professional','Management tools for growing education providers.',6000,64800,'["Everything in Starter","Learner enquiries","Staff management","Reviews","Analytics","Promotions"]',2),
('education','business','Business','Full toolkit for established education providers.',12000,129600,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility"]',3),

('transport','starter','Starter','Essential tools for small transport providers.',3000,32400,'["Business profile","Services","Customer enquiries","Basic dashboard"]',1),
('transport','professional','Professional','Tools for growing transport and logistics providers.',7000,75600,'["Everything in Starter","Fleet/service management","Staff management","Reviews","Analytics"]',2),
('transport','business','Business','Full operating and growth toolkit for transport businesses.',15000,162000,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility"]',3),

('agriculture','starter','Starter','Essential tools for small farms and agribusinesses.',2500,27000,'["Business profile","Products/services","Customer enquiries","Basic dashboard"]',1),
('agriculture','professional','Professional','Tools for growing agricultural businesses.',6000,64800,'["Everything in Starter","Product catalogue","Staff management","Reviews","Analytics","Promotions"]',2),
('agriculture','business','Business','Full growth toolkit for established agribusinesses.',12000,129600,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility"]',3),

('beauty','starter','Starter','Essential tools for small beauty and personal care providers.',2500,27000,'["Business profile","Services","Customer enquiries","Basic dashboard"]',1),
('beauty','professional','Professional','Tools for growing beauty businesses.',5000,54000,'["Everything in Starter","Appointments/enquiries","Staff management","Reviews","Analytics","Promotions"]',2),
('beauty','business','Business','Full growth toolkit for established beauty businesses.',10000,108000,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility"]',3),

('retail','starter','Starter','Essential tools for small retailers.',3000,32400,'["Business profile","Product catalogue","Customer enquiries","Basic dashboard"]',1),
('retail','professional','Professional','Tools for growing retail businesses.',7000,75600,'["Everything in Starter","Product management","Staff management","Reviews","Analytics","Promotions"]',2),
('retail','business','Business','Full operating and growth toolkit for established retailers.',14000,151200,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility"]',3),

('professional-services','starter','Starter','Essential tools for independent professional services.',3000,32400,'["Business profile","Services","Customer enquiries","Basic dashboard"]',1),
('professional-services','professional','Professional','Tools for growing professional service businesses.',7000,75600,'["Everything in Starter","Client enquiries","Team management","Reviews","Analytics","Promotions"]',2),
('professional-services','business','Business','Full growth toolkit for established professional services.',14000,151200,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility"]',3),

('general-business','starter','Starter','Essential tools for a newly introduced business category.',3000,32400,'["Business profile","Service catalogue","Customer enquiries","Basic dashboard"]',1),
('general-business','professional','Professional','Management tools for a growing business category.',7000,75600,'["Everything in Starter","Staff management","Reviews","Analytics","Promotions"]',2),
('general-business','business','Business','Full growth toolkit for an established business category.',14000,151200,'["Everything in Professional","Advanced analytics","Multiple roles","Marketing tools","Priority visibility","Growth tools"]',3)
on conflict (category_slug, plan_code) do update set
  name = excluded.name,
  description = excluded.description,
  monthly_amount = excluded.monthly_amount,
  yearly_amount = excluded.yearly_amount,
  currency = excluded.currency,
  features = excluded.features,
  active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Keep legacy plan/billing semantics while recording the authoritative tier and category.
update public.agency_subscriptions s
set
  category_slug = coalesce(s.category_slug, 'general-business'),
  plan_code = coalesce(s.plan_code, case when s.plan in ('monthly','yearly') then 'starter' else s.plan end),
  plan_id = coalesce(
    s.plan_id,
    (select p.id from public.ecos_subscription_plans p
     where p.category_slug = coalesce(s.category_slug, 'general-business')
       and p.plan_code = coalesce(s.plan_code, case when s.plan in ('monthly','yearly') then 'starter' else s.plan end)
     limit 1)
  )
where s.category_slug is null or s.plan_code is null or s.plan_id is null;

do $$ begin
  alter table public.agency_subscriptions
    add constraint fk_agency_subscriptions_plan
    foreign key (plan_id) references public.ecos_subscription_plans(id)
    on update cascade;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.agency_subscriptions
    add constraint fk_agency_subscriptions_category
    foreign key (category_slug) references public.ecos_subscription_categories(slug)
    on update cascade;
exception when duplicate_object then null; end $$;

create or replace function public.ecos_resolve_subscription_category(p_category text)
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(
    (select a.category_slug
       from public.ecos_subscription_category_aliases a
      where lower(trim(a.alias)) = lower(trim(p_category))
      limit 1),
    (select c.slug
       from public.ecos_subscription_categories c
      where c.slug = lower(trim(regexp_replace(p_category, '[^a-zA-Z0-9]+', '-', 'g')))
        and c.active = true
      limit 1),
    'general-business'
  );
$$;

create or replace function public.create_pending_ecos_subscription(
  p_business_id uuid,
  p_plan_code text,
  p_billing_cycle text
)
returns public.agency_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business public.business%rowtype;
  v_category_slug text;
  v_plan public.ecos_subscription_plans%rowtype;
  v_amount integer;
  v_subscription public.agency_subscriptions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_billing_cycle not in ('monthly', 'yearly') then
    raise exception 'Unsupported billing cycle';
  end if;

  select * into v_business
    from public.business
   where id = p_business_id
     and owner_id = auth.uid();

  if not found then
    raise exception 'Business not found or not owned by current user';
  end if;

  v_category_slug := public.ecos_resolve_subscription_category(v_business.category);

  select * into v_plan
    from public.ecos_subscription_plans
   where category_slug = v_category_slug
     and plan_code = p_plan_code
     and active = true
   limit 1;

  if not found then
    raise exception 'Subscription plan is not available for this business category';
  end if;

  v_amount := case when p_billing_cycle = 'monthly' then v_plan.monthly_amount else v_plan.yearly_amount end;

  if v_amount <= 0 then
    raise exception 'Selected subscription plan is not billable';
  end if;

  insert into public.agency_subscriptions (
    business_id,
    plan,
    amount,
    status,
    category_slug,
    plan_code,
    plan_id,
    payment_reference,
    payment_method
  ) values (
    p_business_id,
    p_billing_cycle,
    v_amount,
    'pending',
    v_category_slug,
    v_plan.plan_code,
    v_plan.id,
    null,
    null
  )
  returning * into v_subscription;

  return v_subscription;
end;
$$;

revoke all on function public.create_pending_ecos_subscription(uuid, text, text) from public, anon, authenticated;
grant execute on function public.create_pending_ecos_subscription(uuid, text, text) to authenticated;

-- Catalog is readable to signed-in users; write access stays server/admin controlled.
alter table public.ecos_subscription_categories enable row level security;
alter table public.ecos_subscription_plans enable row level security;
alter table public.ecos_subscription_category_aliases enable row level security;

drop policy if exists "Authenticated users can read subscription categories" on public.ecos_subscription_categories;
create policy "Authenticated users can read subscription categories"
on public.ecos_subscription_categories for select to authenticated using (active = true);

drop policy if exists "Authenticated users can read active subscription plans" on public.ecos_subscription_plans;
create policy "Authenticated users can read active subscription plans"
on public.ecos_subscription_plans for select to authenticated using (active = true);

drop policy if exists "Authenticated users can read subscription aliases" on public.ecos_subscription_category_aliases;
create policy "Authenticated users can read subscription aliases"
on public.ecos_subscription_category_aliases for select to authenticated using (true);
