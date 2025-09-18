"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, ShieldCheck, Settings } from "lucide-react"
import Link from "next/link"

interface MFAStatusProps {
  userId: string
}

export function MFAStatus({ userId }: MFAStatusProps) {
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMFAStatus = async () => {
      const supabase = createClient()

      try {
        const { data: profile } = await supabase.from("user_profiles").select("mfa_enabled").eq("id", userId).single()

        setMfaEnabled(profile?.mfa_enabled || false)
      } catch (error) {
        console.error("Error checking MFA status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      checkMFAStatus()
    }
  }, [userId])

  if (isLoading) {
    return <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-20 rounded"></div>
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {mfaEnabled ? (
          <>
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              MFA Enabled
            </Badge>
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 text-yellow-600" />
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            >
              MFA Disabled
            </Badge>
          </>
        )}
      </div>

      <Link href="/mfa/setup">
        <Button variant="outline" size="sm" className="h-7 bg-transparent">
          <Settings className="h-3 w-3 mr-1" />
          {mfaEnabled ? "Manage" : "Setup"}
        </Button>
      </Link>
    </div>
  )
}
