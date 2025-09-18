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
import { Shield, Fingerprint, Loader2, Plus, Trash2, Smartphone, Key } from "lucide-react"
import { registerPasskey, isWebAuthnSupported } from "@/lib/utils/passkeys"

interface Passkey {
  id: string
  device_name: string
  created_at: string
  last_used?: string
}

export default function PasskeysSetupPage() {
  const [deviceName, setDeviceName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [isSupported, setIsSupported] = useState(false)
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
      setIsSupported(isWebAuthnSupported())
      await loadPasskeys(user.id)
    }

    checkUser()
  }, [router])

  const loadPasskeys = async (userId: string) => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("user_passkeys")
        .select("id, device_name, created_at, last_used")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setPasskeys(data || [])
    } catch (error) {
      console.error("Error loading passkeys:", error)
    }
  }

  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isSupported) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await registerPasskey(user.email, deviceName || "My Device")

      if (result.success) {
        // Store passkey in database
        const supabase = createClient()
        const { error: insertError } = await supabase.from("user_passkeys").insert({
          user_id: user.id,
          credential_id: result.credentialId,
          public_key: result.publicKey,
          counter: 0,
          device_name: deviceName || "My Device",
        })

        if (insertError) throw insertError

        setSuccess("Passkey registered successfully!")
        setDeviceName("")
        await loadPasskeys(user.id)
      } else {
        throw new Error(result.error || "Failed to register passkey")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to register passkey")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("user_passkeys").delete().eq("id", passkeyId).eq("user_id", user.id)

      if (error) throw error

      setSuccess("Passkey deleted successfully")
      await loadPasskeys(user.id)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to delete passkey")
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

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle>WebAuthn Not Supported</CardTitle>
              <CardDescription>
                Your browser or device doesn't support WebAuthn/FIDO2 passkeys. Please use a modern browser with
                biometric authentication support.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push("/dashboard")} variant="outline">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Passkeys Setup</h1>
        </div>

        <div className="space-y-6">
          {/* Register New Passkey */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Register New Passkey
              </CardTitle>
              <CardDescription>
                Add a new passkey using your device's biometric authentication (Face ID, Touch ID, Windows Hello, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterPasskey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceName">Device Name (Optional)</Label>
                  <Input
                    id="deviceName"
                    type="text"
                    placeholder="e.g., iPhone, MacBook, Windows PC"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="border-slate-300 dark:border-slate-600"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Give your passkey a name to help you identify it later
                  </p>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering Passkey...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Register Passkey
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Passkeys */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Your Passkeys
              </CardTitle>
              <CardDescription>Manage your registered passkeys for passwordless authentication</CardDescription>
            </CardHeader>
            <CardContent>
              {passkeys.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No passkeys registered yet</p>
                  <p className="text-sm">Register your first passkey above to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {passkeys.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="font-medium">{passkey.device_name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Created {new Date(passkey.created_at).toLocaleDateString()}
                            {passkey.last_used && (
                              <span> • Last used {new Date(passkey.last_used).toLocaleDateString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeletePasskey(passkey.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information Card */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">About Passkeys</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Passkeys use your device's built-in security features like Face ID, Touch ID, or Windows Hello for
                    secure, passwordless authentication. They're more secure than passwords and can't be phished or
                    stolen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <Fingerprint className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="bg-transparent">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
