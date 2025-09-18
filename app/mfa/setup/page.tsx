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
import { Shield, Smartphone, Key, Loader2, Check } from "lucide-react"

export default function MFASetupPage() {
  const [totpCode, setTotpCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
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
      generateTOTPSecret(user)
    }

    checkUser()
  }, [router])

  const generateTOTPSecret = async (user: any) => {
    // In a real app, you would use a proper TOTP library like 'otplib'
    // For demo purposes, we'll generate a mock secret and QR code
    const mockSecret = "JBSWY3DPEHPK3PXP" // Base32 encoded secret
    const appName = "SecureAuth Portal"
    const qrUrl = `otpauth://totp/${appName}:${user.email}?secret=${mockSecret}&issuer=${appName}`

    setSecret(mockSecret)
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`)
  }

  const generateBackupCodes = () => {
    const codes = []
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  const enableTOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you would verify the TOTP code against the secret
      // For demo purposes, we'll accept any 6-digit code
      if (!/^\d{6}$/.test(totpCode)) {
        throw new Error("Please enter a valid 6-digit code")
      }

      // Generate backup codes
      const codes = generateBackupCodes()
      setBackupCodes(codes)

      // Update user profile with MFA enabled
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          mfa_enabled: true,
          mfa_secret: secret,
          backup_codes: codes,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("TOTP authentication has been successfully enabled!")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to enable TOTP")
    } finally {
      setIsLoading(false)
    }
  }

  const disableMFA = async () => {
    if (!user) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({
          mfa_enabled: false,
          mfa_secret: null,
          backup_codes: null,
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      setSuccess("Multi-factor authentication has been disabled")
      setBackupCodes([])
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to disable MFA")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">MFA Setup</h1>
        </div>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Multi-Factor Authentication Setup
            </CardTitle>
            <CardDescription>Add an extra layer of security to your account with TOTP authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="setup">Setup TOTP</TabsTrigger>
                <TabsTrigger value="manage">Manage MFA</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="space-y-6">
                {!success ? (
                  <>
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Step 1: Scan QR Code</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code
                        </p>
                        {qrCodeUrl && (
                          <div className="flex justify-center">
                            <img
                              src={qrCodeUrl || "/placeholder.svg"}
                              alt="TOTP QR Code"
                              className="border rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <h4 className="font-medium mb-2">Or enter this secret manually:</h4>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                          <code className="text-sm font-mono">{secret}</code>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={enableTOTP} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="totpCode">Step 2: Enter verification code</Label>
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
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading || totpCode.length !== 6}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enabling TOTP...
                          </>
                        ) : (
                          "Enable TOTP Authentication"
                        )}
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <Check className="h-12 w-12 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-600">TOTP Enabled Successfully!</h3>

                    {backupCodes.length > 0 && (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                            <Key className="h-4 w-4 inline mr-1" />
                            Backup Codes
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                            Save these backup codes in a safe place. You can use them to access your account if you lose
                            your authenticator device.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {backupCodes.map((code, index) => (
                              <code
                                key={index}
                                className="bg-white dark:bg-slate-800 p-2 rounded text-sm font-mono border"
                              >
                                {code}
                              </code>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <Button onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                      Go to Dashboard
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manage" className="space-y-4">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Manage MFA Settings</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You can disable multi-factor authentication if needed
                  </p>

                  <Button onClick={disableMFA} disabled={isLoading} variant="destructive" className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Disabling MFA...
                      </>
                    ) : (
                      "Disable Multi-Factor Authentication"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
