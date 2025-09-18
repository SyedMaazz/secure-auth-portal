-- Create email OTPs table for email-based MFA
create table if not exists public.email_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  otp_code text not null,
  expires_at timestamp with time zone not null,
  used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  used_at timestamp with time zone
);

-- Enable RLS on email_otps
alter table public.email_otps enable row level security;

-- RLS policies for email_otps
create policy "users_can_view_own_otps"
  on public.email_otps for select
  using (auth.uid() = user_id);

create policy "users_can_insert_own_otps"
  on public.email_otps for insert
  with check (auth.uid() = user_id);

create policy "users_can_update_own_otps"
  on public.email_otps for update
  using (auth.uid() = user_id);

-- Index for faster lookups
create index if not exists idx_email_otps_user_id on public.email_otps(user_id);
create index if not exists idx_email_otps_code on public.email_otps(otp_code);
create index if not exists idx_email_otps_expires on public.email_otps(expires_at);
