-- ============================================================
-- DELPHINE ECOSYSTEM OS — Core schema (Phase B)
-- Applied to project mohogdfdzmewwvgcizga on 2026-06-04
-- via Supabase MCP migration "os_core_schema_and_rls".
-- 1) RLS lockdown of legacy tables  2) OS content/ops tables
-- All access goes through the OS server (service role).
-- No anon policies on purpose: anon key gets zero access.
-- ============================================================

-- ── 1. Lock down legacy SMCC tables (Supabase critical advisory) ──
alter table public.leads          enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.chat_messages  enable row level security;
alter table public.appointments   enable row level security;

-- ── 2. Brands ──
create table public.brands (
  key        text primary key check (key in ('delphine','smcc','ewoman','drimp')),
  name       text not null,
  domain     text,
  accent     text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.brands (key, name, domain, accent) values
  ('delphine', 'Delphine Nforgwei',                               'delphine-nforgwei.com',    '#C9A227'),
  ('smcc',     'SMCC — School of Marriage Counseling & Coaching', 'smcc.solutions',           '#5B1A5D'),
  ('ewoman',   'E-Woman Conference',                              'e-womanconference.online', '#8A3B5C'),
  ('drimp',    'DRIMP Foundation',                                'drimpfoundation.org',      '#2A6041');

-- ── 3. Media library ──
create table public.media (
  id         uuid primary key default gen_random_uuid(),
  brand_key  text not null references public.brands(key),
  url        text not null,
  storage    text not null default 'public_folder' check (storage in ('supabase','r2','public_folder','external')),
  alt        text,
  width      integer,
  height     integer,
  created_by uuid,
  created_at timestamptz not null default now()
);

-- ── 4. Pages + structured sections (Page Builder) ──
create table public.pages (
  id         uuid primary key default gen_random_uuid(),
  brand_key  text not null references public.brands(key),
  slug       text not null,
  title      text not null,
  status     text not null default 'draft' check (status in ('draft','review','published')),
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_key, slug)
);
create table public.sections (
  id           uuid primary key default gen_random_uuid(),
  page_id      uuid not null references public.pages(id) on delete cascade,
  type         text not null check (type in ('hero','text','cards','cta','image','event_block','program_card')),
  title        text,
  subtitle     text,
  body         text,
  image_id     uuid references public.media(id),
  button_label text,
  button_url   text,
  "order"      integer not null default 0
);

-- ── 5. Blog posts ──
create table public.posts (
  id                uuid primary key default gen_random_uuid(),
  brand_key         text not null references public.brands(key),
  slug              text not null,
  title             text not null,
  excerpt           text,
  body              text,
  featured_image_id uuid references public.media(id),
  author            text,
  category          text,
  tags              text[] not null default '{}',
  status            text not null default 'draft' check (status in ('draft','review','published')),
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (brand_key, slug)
);

-- ── 6. Events (os_events: "events" name reserved for legacy smcc analytics) ──
create table public.os_events (
  id                  uuid primary key default gen_random_uuid(),
  brand_key           text not null references public.brands(key),
  slug                text not null,
  title               text not null,
  description         text,
  event_date          date,
  start_time          time,
  location            text,
  price_xaf           integer,
  payunit_url         text,
  whatsapp_cta        text,
  facebook_embed_url  text,
  featured_image_id   uuid references public.media(id),
  registration_status text not null default 'open' check (registration_status in ('open','closed','waitlist')),
  status              text not null default 'draft' check (status in ('draft','review','published')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (brand_key, slug)
);

-- ── 7. Message center ──
create table public.conversations (
  id              uuid primary key default gen_random_uuid(),
  brand_key       text not null references public.brands(key),
  channel         text not null check (channel in ('whatsapp','email','telegram','webform')),
  contact_name    text,
  contact_phone   text,
  contact_email   text,
  status          text not null default 'open' check (status in ('open','pending','resolved')),
  flags           text[] not null default '{}',
  last_message_at timestamptz,
  created_at      timestamptz not null default now()
);
create table public.os_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction       text not null check (direction in ('in','out')),
  body            text,
  raw_meta        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

-- ── 8. Payment center ──
create table public.payment_claims (
  id              uuid primary key default gen_random_uuid(),
  brand_key       text not null references public.brands(key),
  program_name    text not null,
  amount_xaf      integer,
  payunit_url     text,
  claimant_name   text,
  claimant_phone  text,
  claimant_email  text,
  proof_url       text,
  status          text not null default 'claimed' check (status in ('claimed','pending_confirmation','confirmed','rejected')),
  source          text check (source in ('webhook','manual','whatsapp')),
  verified_by     uuid,
  verified_at     timestamptz,
  created_at      timestamptz not null default now()
);

-- ── 9. Notifications (Telegram layer) ──
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  type          text not null,
  brand_key     text references public.brands(key),
  payload       jsonb not null default '{}',
  telegram_sent boolean not null default false,
  os_link       text,
  created_at    timestamptz not null default now()
);

-- ── 10. AI Content Studio drafts (never auto-published) ──
create table public.ai_drafts (
  id              uuid primary key default gen_random_uuid(),
  brand_key       text not null references public.brands(key),
  kind            text not null check (kind in ('blog','event','caption','broadcast')),
  raw_input       text,
  input_media_url text,
  output          text,
  model           text,
  status          text not null default 'draft' check (status in ('draft','review','approved','published')),
  reviewed_by     uuid,
  created_at      timestamptz not null default now()
);

-- ── 11. Indexes ──
create index on public.sections (page_id, "order");
create index on public.posts (brand_key, status, published_at desc);
create index on public.os_events (brand_key, status, event_date);
create index on public.conversations (brand_key, status, last_message_at desc);
create index on public.os_messages (conversation_id, created_at);
create index on public.payment_claims (brand_key, status, created_at desc);
create index on public.notifications (created_at desc);
create index on public.ai_drafts (brand_key, status, created_at desc);

-- ── 12. RLS: enabled everywhere, zero anon/authenticated policies.
--      The OS server (service role) bypasses RLS by design. ──
alter table public.brands         enable row level security;
alter table public.media          enable row level security;
alter table public.pages          enable row level security;
alter table public.sections       enable row level security;
alter table public.posts          enable row level security;
alter table public.os_events      enable row level security;
alter table public.conversations  enable row level security;
alter table public.os_messages    enable row level security;
alter table public.payment_claims enable row level security;
alter table public.notifications  enable row level security;
alter table public.ai_drafts      enable row level security;

-- ── 13. updated_at maintenance ──
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
create trigger pages_updated_at     before update on public.pages     for each row execute function public.set_updated_at();
create trigger posts_updated_at     before update on public.posts     for each row execute function public.set_updated_at();
create trigger os_events_updated_at before update on public.os_events for each row execute function public.set_updated_at();
