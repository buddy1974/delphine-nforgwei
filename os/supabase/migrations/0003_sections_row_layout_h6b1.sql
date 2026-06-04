-- H6B.1: Add row / column layout support to sections
-- parent_id  → child sections belong to a row container
-- col        → 0-based column index within the parent row
-- layout     → column width spec for type='row' sections
-- type CHECK → extended to allow 'row'

alter table public.sections
  add column if not exists parent_id uuid references public.sections(id) on delete cascade,
  add column if not exists col       integer,
  add column if not exists layout    text;

alter table public.sections
  drop constraint if exists sections_type_check;

alter table public.sections
  add constraint sections_type_check
  check (type in ('row','hero','text','cards','cta','image','event_block','program_card'));

create index if not exists sections_parent_id_idx
  on public.sections (parent_id)
  where parent_id is not null;
