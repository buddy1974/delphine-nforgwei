-- Add image_url text column to sections (the code uses image_url, not image_id FK)
alter table public.sections
  add column if not exists image_url text;

-- Page version snapshots for the Version History feature
create table if not exists public.page_versions (
  id         uuid primary key default gen_random_uuid(),
  page_id    uuid not null references public.pages(id) on delete cascade,
  label      text,
  title      text not null,
  status     text not null,
  sections   jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists page_versions_page_id_created
  on public.page_versions (page_id, created_at desc);

alter table public.page_versions enable row level security;
