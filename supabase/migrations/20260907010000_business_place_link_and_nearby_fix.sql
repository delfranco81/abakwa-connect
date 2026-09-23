begin;

alter table public.business
  add column if not exists place_id uuid;

alter table public.business
  drop constraint if exists business_place_id_fkey;

alter table public.business
  add constraint business_place_id_fkey
  foreign key (place_id)
  references public.places(id)
  on delete set null;

create index if not exists business_place_id_idx
  on public.business(place_id);

create or replace function public.get_nearby_places(
  user_lat double precision,
  user_lng double precision,
  search_category text default 'all'::text,
  radius_km double precision default 10.0
)
returns table(
  id uuid,
  title text,
  content text,
  image text,
  lat double precision,
  lng double precision,
  visit_count integer,
  distance_km double precision
)
language plpgsql
as $function$
begin
  return query
  select
    p.id,
    p.name as title,
    p.description as content,
    p.image,
    coalesce(p.latitude, p.lat) as lat,
    coalesce(p.longitude, p.lng) as lng,
    p.visit_count,
    (
      6371 * acos(
        least(
          1.0,
          greatest(
            -1.0,
            cos(radians(user_lat)) *
            cos(radians(coalesce(p.latitude, p.lat))) *
            cos(
              radians(coalesce(p.longitude, p.lng)) -
              radians(user_lng)
            ) +
            sin(radians(user_lat)) *
            sin(radians(coalesce(p.latitude, p.lat)))
          )
        )
      )
    ) as distance_km
  from public.places p
  where
    coalesce(p.latitude, p.lat) is not null
    and coalesce(p.longitude, p.lng) is not null
    and (
      search_category = 'all'
      or p.category ilike '%' || search_category || '%'
      or p.name ilike '%' || search_category || '%'
      or coalesce(p.description, '') ilike '%' || search_category || '%'
    )
    and (
      6371 * acos(
        least(
          1.0,
          greatest(
            -1.0,
            cos(radians(user_lat)) *
            cos(radians(coalesce(p.latitude, p.lat))) *
            cos(
              radians(coalesce(p.longitude, p.lng)) -
              radians(user_lng)
            ) +
            sin(radians(user_lat)) *
            sin(radians(coalesce(p.latitude, p.lat)))
          )
        )
      )
    ) <= radius_km
  order by distance_km asc;
end;
$function$;

comment on column public.business.place_id
  is 'Public geographic/discovery place associated with this business.';

commit;
