"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Mail, Smartphone, Loader2 } from "lucide-react"

export default function MFAPage() {
  const [emailOtp, setEmailOtp] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
    }

    checkUser()
  }, [router])

  const sendEmailOTP = async () => {
    if (!user) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store OTP in database
      const { error: insertError } = await supabase.from("email_otps").insert({
        user_id: user.id,
        email: user.email,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
      })

      if (insertError) throw insertError

      // In a real app, you would send this via email service
      // For demo purposes, we'll show it in console
      console.log(`[DEMO] Email OTP for ${user.email}: ${otpCode}`)

      setIsEmailSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Verify OTP
      const { data: otpData, error: otpError } = await supabase
        .from("email_otps")
        .select("*")
        .eq("user_id", user.id)
        .eq("otp_code", emailOtp)
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (otpError || !otpData) {
        throw new Error("Invalid or expired OTP code")
      }

      // Mark OTP as used
      await supabase.from("email_otps").update({ used: true, used_at: new Date().toISOString() }).eq("id", otpData.id)

      // Update last login
      await supabase.from("user_profiles").update({ last_login: new Date().toISOString() }).eq("id", user.id)

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyTOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Get user's TOTP secret
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("mfa_secret")
        .eq("id", user.id)
        .single()

      if (profileError || !profile?.mfa_secret) {
        throw new Error("TOTP not set up for this account")
      }

      // In a real app, you would verify the TOTP code against the secret
      // For demo purposes, we'll accept any 6-digit code
      if (!/^\d{6}$/.test(totpCode)) {
        throw new Error("Please enter a valid 6-digit code")
      }

      // Update last login
      await supabase.from("user_profiles").update({ last_login: new Date().toISOString() }).eq("id", user.id)

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">SecureAuth Portal</h1>
        </div>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Multi-Factor Authentication</CardTitle>
            <CardDescription>Complete your secure login with a second factor</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email OTP
                </TabsTrigger>
                <TabsTrigger value="totp" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Authenticator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                {!isEmailSent ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      We'll send a 6-digit code to your email address
                    </p>
                    <Button
                      onClick={sendEmailOTP}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Email Code"
                      )}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={verifyEmailOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailOtp">Enter 6-digit code</Label>
                      <Input
                        id="emailOtp"
                        type="text"
                        placeholder="123456"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg tracking-widest border-slate-300 dark:border-slate-600"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || emailOtp.length !== 6}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="totp" className="space-y-4">
                <form onSubmit={verifyTOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="totpCode">Authenticator Code</Label>
                    <Input
                      id="totpCode"
                      type="text"
                      placeholder="123456"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      className="text-center text-lg tracking-widest border-slate-300 dark:border-slate-600"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                  <Button
                    type="submit"
                    disabled={isLoading || totpCode.length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
