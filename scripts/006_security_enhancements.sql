-- Add security-related indexes and constraints for better performance and security

-- Index for faster rate limiting checks
create index if not exists idx_user_profiles_email_attempts on public.user_profiles(email, login_attempts);
create index if not exists idx_user_profiles_locked_until on public.user_profiles(locked_until) where locked_until is not null;

-- Add constraint to prevent negative login attempts
alter table public.user_profiles add constraint check_login_attempts_non_negative check (login_attempts >= 0);

-- Add constraint to ensure locked_until is in the future when set
alter table public.user_profiles add constraint check_locked_until_future check (locked_until is null or locked_until > now());

-- Create function to clean up expired OTPs and sessions
create or replace function public.cleanup_expired_security_data()
returns void
language plpgsql
security definer
as $$
begin
  -- Clean up expired email OTPs
  delete from public.email_otps where expires_at < now();
  
  -- Clean up expired MFA sessions
  delete from public.mfa_sessions where expires_at < now();
  
  -- Reset login attempts for accounts that have been locked for more than 24 hours
  update public.user_profiles 
  set login_attempts = 0, locked_until = null 
  where locked_until is not null and locked_until < now() - interval '24 hours';
end;
$$;

-- Create a scheduled job to run cleanup (this would typically be done via pg_cron or external scheduler)
-- For demo purposes, we'll just create the function
comment on function public.cleanup_expired_security_data() is 'Cleans up expired security data - should be run periodically';
