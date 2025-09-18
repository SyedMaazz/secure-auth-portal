import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Fingerprint, Mail } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">SecureAuth Portal</h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance">
            Advanced authentication platform with multi-factor security, passkeys, and enterprise-grade protection
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Lock className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>Email OTP and TOTP authenticator app support for enhanced security</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Fingerprint className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Passkeys Support</CardTitle>
              <CardDescription>WebAuthn/FIDO2 passwordless authentication with biometrics</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <Mail className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Secure Email Auth</CardTitle>
              <CardDescription>Industry-standard email and password authentication with encryption</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Choose your preferred authentication method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/auth/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
