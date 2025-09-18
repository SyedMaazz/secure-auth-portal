-- Create MFA sessions table to track multi-factor authentication attempts
create table if not exists public.mfa_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_token text not null unique,
  mfa_type text not null check (mfa_type in ('email_otp', 'totp', 'passkey')),
  verified boolean default false,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verified_at timestamp with time zone
);

-- Enable RLS on mfa_sessions
alter table public.mfa_sessions enable row level security;

-- RLS policies for mfa_sessions
create policy "users_can_view_own_mfa_sessions"
  on public.mfa_sessions for select
  using (auth.uid() = user_id);

create policy "users_can_insert_own_mfa_sessions"
  on public.mfa_sessions for insert
  with check (auth.uid() = user_id);

create policy "users_can_update_own_mfa_sessions"
  on public.mfa_sessions for update
  using (auth.uid() = user_id);

-- Index for faster lookups
create index if not exists idx_mfa_sessions_user_id on public.mfa_sessions(user_id);
create index if not exists idx_mfa_sessions_token on public.mfa_sessions(session_token);
create index if not exists idx_mfa_sessions_expires on public.mfa_sessions(expires_at);
