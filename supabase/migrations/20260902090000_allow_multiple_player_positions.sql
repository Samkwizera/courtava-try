begin;

alter table public.profiles
alter column position type text[]
using case
  when position is null or btrim(position) = '' then null
  else array[position]
end;

comment on column public.profiles.position is
'Basketball positions selected by the player.';

commit;
