import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, User, Lock, Fingerprint, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Account Settings</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage your security preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</p>
                <p className="text-slate-900 dark:text-slate-100 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {data.user.email}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Created</p>
                <p className="text-slate-900 dark:text-slate-100 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "Recently"}
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                Update Profile (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your authentication methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/mfa/setup" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Lock className="h-4 w-4 mr-2" />
                  Multi-Factor Authentication
                </Button>
              </Link>
              <Link href="/passkeys/setup" className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Manage Passkeys
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start bg-transparent" disabled>
                <Mail className="h-4 w-4 mr-2" />
                Change Password (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>Control your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Data Retention</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Your data is stored securely and encrypted. Login attempts and security events are logged for 90 days.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Deletion</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  You can request account deletion at any time. This action is irreversible.
                </p>
              </div>
              <Button variant="destructive" className="w-full" disabled>
                Delete Account (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Session Management */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Manage your active login sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">Current Session</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">This device • Active now</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Manage All Sessions (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
