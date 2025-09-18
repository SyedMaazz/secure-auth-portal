-- Create user profiles table to store additional user data
-- This references auth.users(id) as foreign key with cascade delete
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  mfa_enabled boolean default false,
  mfa_secret text, -- For TOTP authentication
  backup_codes text[], -- Array of backup codes for MFA recovery
  last_login timestamp with time zone,
  login_attempts integer default 0,
  locked_until timestamp with time zone,
  email_verified boolean default false
);

-- Enable RLS on user_profiles
alter table public.user_profiles enable row level security;

-- RLS policies for user_profiles
create policy "users_can_view_own_profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "users_can_insert_own_profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "users_can_update_own_profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "users_can_delete_own_profile"
  on public.user_profiles for delete
  using (auth.uid() = id);
