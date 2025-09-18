/**
 * Utility functions for Multi-Factor Authentication
 */

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Generate backup codes for MFA recovery
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    codes.push(code)
  }
  return codes
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt)
}

/**
 * Validate OTP format (6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

/**
 * Generate TOTP secret (Base32 encoded)
 * In a real app, use a proper crypto library
 */
export function generateTOTPSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
  let secret = ""
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

/**
 * Generate TOTP QR code URL
 */
export function generateTOTPQRCode(email: string, secret: string, issuer = "SecureAuth Portal"): string {
  const otpUrl = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUrl)}`
}
