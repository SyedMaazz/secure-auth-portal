export interface UserProfile {
  id: string
  email: string
  created_at: string
  updated_at: string
  mfa_enabled: boolean
  mfa_secret?: string
  backup_codes?: string[]
  last_login?: string
  login_attempts: number
  locked_until?: string
  email_verified: boolean
}

export interface MFASession {
  id: string
  user_id: string
  session_token: string
  mfa_type: "email_otp" | "totp" | "passkey"
  verified: boolean
  expires_at: string
  created_at: string
  verified_at?: string
}

export interface EmailOTP {
  id: string
  user_id: string
  email: string
  otp_code: string
  expires_at: string
  used: boolean
  created_at: string
  used_at?: string
}

export interface UserPasskey {
  id: string
  user_id: string
  credential_id: string
  public_key: Uint8Array
  counter: number
  device_name?: string
  created_at: string
  last_used?: string
}
