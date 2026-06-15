-- Secure short-lived preview sessions for immutable page_versions.
-- No anon/authenticated policies are created; the OS service role is the only writer/reader.

create table if not exists public.preview_sessions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  page_version_id uuid not null references public.page_versions(id) on delete cascade,
  brand_key text not null references public.brands(key),
  viewer_id uuid null,
  viewer_role text null,
  nonce_hash text not null,
  token_expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_by uuid null,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz null,
  access_count integer not null default 0
);

create index if not exists preview_sessions_page_version_id
  on public.preview_sessions (page_version_id);

create index if not exists preview_sessions_brand_created
  on public.preview_sessions (brand_key, created_at desc);

create index if not exists preview_sessions_token_expires
  on public.preview_sessions (token_expires_at);

alter table public.preview_sessions enable row level security;
