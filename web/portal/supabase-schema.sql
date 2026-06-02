create table if not exists public.shops (
  id text primary key,
  owner_user_id text not null,
  name text not null,
  category text not null,
  description text not null default '',
  slogan text not null default '',
  street text not null default '',
  house_number text not null default '',
  zip text not null default '',
  city text not null default '',
  country text not null default 'Schweiz',
  latitude double precision not null default 47.1368,
  longitude double precision not null default 7.2468,
  phone text not null default '',
  email text not null default '',
  website text,
  opening_hours jsonb not null default '{}'::jsonb,
  products jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  logo_url text not null default '',
  hero_image_url text not null default '',
  gallery_image_urls jsonb not null default '[]'::jsonb,
  map_icon text not null default 'cafe',
  subscription_status text not null default 'active',
  admin_approved boolean not null default false,
  is_visible_on_map boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_users (
  id text primary key,
  role text not null default 'user',
  name text not null,
  birth_date text not null default '',
  email text not null default '',
  phone text not null default '',
  qr_code_value text unique,
  points_balance integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.offers (
  id text primary key,
  shop_id text not null references public.shops(id) on delete cascade,
  title text not null,
  description text not null default '',
  type text not null default 'special',
  discount_percent integer,
  free_item text,
  purchase_requirement text,
  fixed_price_label text,
  bundle_details text,
  max_redemptions integer,
  inventory_total integer,
  reward_label text,
  friends_required integer,
  points_reward integer,
  promotion jsonb,
  valid_until timestamptz not null default timezone('utc', now()),
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.redemptions (
  id text primary key,
  offer_id text not null references public.offers(id) on delete cascade,
  shop_id text not null references public.shops(id) on delete cascade,
  user_id text not null,
  qr_code_value text not null,
  confirmed_by_shop_user_id text not null,
  points_awarded integer not null default 0,
  status text not null default 'confirmed',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.portal_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null,
  shop_id text references public.shops(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.shops replica identity full;
alter table public.app_users replica identity full;
alter table public.offers replica identity full;
alter table public.redemptions replica identity full;
alter table public.portal_users replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shops'
  ) then
    alter publication supabase_realtime add table public.shops;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_users'
  ) then
    alter publication supabase_realtime add table public.app_users;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'offers'
  ) then
    alter publication supabase_realtime add table public.offers;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'redemptions'
  ) then
    alter publication supabase_realtime add table public.redemptions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portal_users'
  ) then
    alter publication supabase_realtime add table public.portal_users;
  end if;
end $$;

alter table public.shops disable row level security;
alter table public.app_users disable row level security;
alter table public.offers disable row level security;
alter table public.redemptions disable row level security;
alter table public.portal_users disable row level security;
