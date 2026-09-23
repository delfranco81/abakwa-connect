begin;

drop policy if exists "Customers can delete own cleaning bookings"
on public.bookings;

create policy "Customers can delete own cleaning bookings"
on public.bookings
for delete
to authenticated
using (
  auth.uid() = customer_id
  and cleaning_category is not null
);

commit;
