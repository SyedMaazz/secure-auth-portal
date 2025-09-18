-- Create passkeys table to store WebAuthn credentials
create table if not exists public.user_passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_id text not null unique,
  public_key bytea not null,
  counter bigint not null default 0,
  device_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_used timestamp with time zone
);

-- Enable RLS on user_passkeys
alter table public.user_passkeys enable row level security;

-- RLS policies for user_passkeys
create policy "users_can_view_own_passkeys"
  on public.user_passkeys for select
  using (auth.uid() = user_id);

create policy "users_can_insert_own_passkeys"
  on public.user_passkeys for insert
  with check (auth.uid() = user_id);

create policy "users_can_update_own_passkeys"
  on public.user_passkeys for update
  using (auth.uid() = user_id);

create policy "users_can_delete_own_passkeys"
  on public.user_passkeys for delete
  using (auth.uid() = user_id);

-- Index for faster lookups
create index if not exists idx_user_passkeys_user_id on public.user_passkeys(user_id);
create index if not exists idx_user_passkeys_credential_id on public.user_passkeys(credential_id);
