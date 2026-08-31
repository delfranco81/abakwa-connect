create table if not exists public.ecos_category_items (
  id uuid primary key default gen_random_uuid(),

  category_slug text not null,
  subcategory text,

  name text not null,
  description text,

  address text,
  area text,
  city text,
  region text,

  phone text,
  email text,
  website text,

  image text,

  latitude double precision,
  longitude double precision,

  verified boolean not null default false,
  rating numeric(2,1),

  status text not null default 'pending',

  popularity_score integer not null default 0,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists
ecos_category_items_category_idx
on public.ecos_category_items(category_slug);

create index if not exists
ecos_category_items_subcategory_idx
on public.ecos_category_items(subcategory);

create index if not exists
ecos_category_items_status_idx
on public.ecos_category_items(status);

create index if not exists
ecos_category_items_popularity_idx
on public.ecos_category_items(popularity_score desc);

create index if not exists
ecos_category_items_city_idx
on public.ecos_category_items(city);

alter table public.ecos_category_items
enable row level security;

drop policy if exists
"Public can view approved category items"
on public.ecos_category_items;

create policy
"Public can view approved category items"
on public.ecos_category_items
for select
to anon, authenticated
using (
  status = 'approved'
);

create or replace function public.set_ecos_category_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
ecos_category_items_updated_at
on public.ecos_category_items;

create trigger
ecos_category_items_updated_at
before update on public.ecos_category_items
for each row
execute function public.set_ecos_category_items_updated_at();
