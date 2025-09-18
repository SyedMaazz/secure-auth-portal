import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Settings, Activity, Lock, Fingerprint } from "lucide-react"
import Link from "next/link"
import { MFAStatus } from "@/components/mfa-status"
import { PasskeyStatus } from "@/components/passkey-status"
import { LogoutButton } from "@/components/logout-button"
import { SecurityMonitor } from "@/components/security-monitor"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user.id).single()

  // Get recent login activity (simplified for demo)
  const recentLogins = [
    { device: "MacBook Pro", location: "San Francisco, CA", time: "2 minutes ago", current: true },
    { device: "iPhone 15", location: "San Francisco, CA", time: "1 hour ago", current: false },
    { device: "Chrome Browser", location: "San Francisco, CA", time: "Yesterday", current: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">SecureAuth Portal</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Security Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/settings">
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome back, {data.user.email}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your account is secured with advanced authentication methods
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Overview */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Overview
                </CardTitle>
                <CardDescription>Your account information and security status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</p>
                    <p className="text-slate-900 dark:text-slate-100">{data.user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Status</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active & Verified
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Member Since</p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Login</p>
                    <p className="text-slate-900 dark:text-slate-100">
                      {profile?.last_login ? new Date(profile.last_login).toLocaleString() : "First time"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Features
                </CardTitle>
                <CardDescription>Manage your authentication methods and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* MFA Status */}
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Multi-Factor Authentication</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Add an extra layer of security with TOTP or email verification
                    </p>
                  </div>
                  <MFAStatus userId={data.user.id} />
                </div>

                {/* Passkeys Status */}
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Passkeys</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Passwordless authentication using biometrics or security keys
                    </p>
                  </div>
                  <PasskeyStatus userId={data.user.id} />
                </div>

                {/* Password Security */}
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Password Security</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Your password is encrypted and securely stored
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Strong</Badge>
                    <Link href="/settings/password">
                      <Button variant="outline" size="sm" className="h-7 bg-transparent">
                        <Settings className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Monitor */}
            <SecurityMonitor userId={data.user.id} />

            {/* Recent Activity */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent login sessions and security events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLogins.map((login, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{login.device}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{login.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-900 dark:text-slate-100">{login.time}</p>
                        {login.current && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/mfa/setup" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Lock className="h-4 w-4 mr-2" />
                    Setup MFA
                  </Button>
                </Link>
                <Link href="/passkeys/setup" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Fingerprint className="h-4 w-4 mr-2" />
                    Manage Passkeys
                  </Button>
                </Link>
                <Link href="/settings" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Security Score */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Security Score</CardTitle>
                <CardDescription>Your account security rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-700"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="85, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">85%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Excellent</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Your account has strong security measures
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Security Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Enable both MFA and passkeys for maximum security. Passkeys provide the strongest protection against
                  phishing attacks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
