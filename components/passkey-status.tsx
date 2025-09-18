"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Fingerprint, Settings } from "lucide-react"
import Link from "next/link"

interface PasskeyStatusProps {
  userId: string
}

export function PasskeyStatus({ userId }: PasskeyStatusProps) {
  const [passkeyCount, setPasskeyCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPasskeyStatus = async () => {
      const supabase = createClient()

      try {
        const { count } = await supabase
          .from("user_passkeys")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)

        setPasskeyCount(count || 0)
      } catch (error) {
        console.error("Error checking passkey status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      checkPasskeyStatus()
    }
  }, [userId])

  if (isLoading) {
    return <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-24 rounded"></div>
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Fingerprint className="h-4 w-4 text-blue-600" />
        <Badge
          variant="secondary"
          className={
            passkeyCount > 0
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          }
        >
          {passkeyCount} Passkey{passkeyCount !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Link href="/passkeys/setup">
        <Button variant="outline" size="sm" className="h-7 bg-transparent">
          <Settings className="h-3 w-3 mr-1" />
          {passkeyCount > 0 ? "Manage" : "Setup"}
        </Button>
      </Link>
    </div>
  )
}
