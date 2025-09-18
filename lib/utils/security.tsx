/**
 * Security utility functions for rate limiting, password validation, and security monitoring
 */

import { createClient } from "@/lib/supabase/client"

/**
 * Password strength validation
 */
export interface PasswordStrength {
  score: number
  feedback: string[]
  isStrong: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score += 20
  } else {
    feedback.push("Password must be at least 8 characters long")
  }

  if (password.length >= 12) {
    score += 10
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 15
  } else {
    feedback.push("Add lowercase letters")
  }

  if (/[A-Z]/.test(password)) {
    score += 15
  } else {
    feedback.push("Add uppercase letters")
  }

  if (/\d/.test(password)) {
    score += 15
  } else {
    feedback.push("Add numbers")
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 15
  } else {
    feedback.push("Add special characters")
  }

  // Common patterns check
  if (!/(.)\1{2,}/.test(password)) {
    score += 10
  } else {
    feedback.push("Avoid repeating characters")
  }

  return {
    score: Math.min(score, 100),
    feedback,
    isStrong: score >= 80,
  }
}

/**
 * Check for common passwords
 */
const commonPasswords = [
  "password",
  "123456",
  "password123",
  "admin",
  "qwerty",
  "letmein",
  "welcome",
  "monkey",
  "dragon",
  "master",
]

export function isCommonPassword(password: string): boolean {
  return commonPasswords.includes(password.toLowerCase())
}

/**
 * Rate limiting for login attempts
 */
export async function checkRateLimit(email: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const supabase = createClient()

  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("login_attempts, locked_until")
      .eq("email", email)
      .single()

    if (!profile) {
      return { allowed: true, remainingAttempts: 5 }
    }

    // Check if account is locked
    if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
      return { allowed: false, remainingAttempts: 0 }
    }

    const maxAttempts = 5
    const remainingAttempts = Math.max(0, maxAttempts - profile.login_attempts)

    return {
      allowed: remainingAttempts > 0,
      remainingAttempts,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    return { allowed: true, remainingAttempts: 5 }
  }
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(email: string): Promise<void> {
  const supabase = createClient()

  try {
    const { data: profile } = await supabase.from("user_profiles").select("login_attempts").eq("email", email).single()

    if (profile) {
      const newAttempts = profile.login_attempts + 1
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes

      await supabase
        .from("user_profiles")
        .update({
          login_attempts: newAttempts,
          locked_until: lockUntil?.toISOString(),
        })
        .eq("email", email)
    }
  } catch (error) {
    console.error("Failed to record login attempt:", error)
  }
}

/**
 * Reset login attempts on successful login
 */
export async function resetLoginAttempts(userId: string): Promise<void> {
  const supabase = createClient()

  try {
    await supabase
      .from("user_profiles")
      .update({
        login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", userId)
  } catch (error) {
    console.error("Failed to reset login attempts:", error)
  }
}

/**
 * Generate secure session token
 */
export function generateSecureToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Hash sensitive data (for demo purposes - use proper crypto in production)
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Check if device is trusted (simplified implementation)
 */
export function isTrustedDevice(): boolean {
  if (typeof window === "undefined") return false

  const trustedDevices = JSON.parse(localStorage.getItem("trustedDevices") || "[]")
  const deviceFingerprint = generateDeviceFingerprint()

  return trustedDevices.includes(deviceFingerprint)
}

/**
 * Generate device fingerprint for device recognition
 */
export function generateDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server"

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  ctx?.fillText("Device fingerprint", 10, 10)

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join("|")

  return btoa(fingerprint).slice(0, 32)
}

/**
 * Mark device as trusted
 */
export function trustDevice(): void {
  if (typeof window === "undefined") return

  const trustedDevices = JSON.parse(localStorage.getItem("trustedDevices") || "[]")
  const deviceFingerprint = generateDeviceFingerprint()

  if (!trustedDevices.includes(deviceFingerprint)) {
    trustedDevices.push(deviceFingerprint)
    localStorage.setItem("trustedDevices", JSON.stringify(trustedDevices))
  }
}
