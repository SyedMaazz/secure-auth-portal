"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface SecurityScoreProps {
  userId: string
}

export function SecurityScore({ userId }: SecurityScoreProps) {
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const calculateScore = async () => {
      const supabase = createClient()

      try {
        // Get user profile and security features
        const { data: profile } = await supabase.from("user_profiles").select("mfa_enabled").eq("id", userId).single()

        const { count: passkeyCount } = await supabase
          .from("user_passkeys")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)

        // Calculate score based on security features
        let calculatedScore = 40 // Base score for having an account

        if (profile?.mfa_enabled) {
          calculatedScore += 30 // MFA adds 30 points
        }

        if (passkeyCount && passkeyCount > 0) {
          calculatedScore += 30 // Passkeys add 30 points
        }

        // Email verification (assumed true if they can log in)
        calculatedScore += 15 // Email verification adds 15 points

        setScore(Math.min(calculatedScore, 100))
      } catch (error) {
        console.error("Error calculating security score:", error)
        setScore(40) // Default score
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      calculateScore()
    }
  }, [userId])

  if (isLoading) {
    return <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-24 w-24 rounded-full mx-auto"></div>
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Improvement"
  }

  return (
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
            className={getScoreColor(score)}
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
        </div>
      </div>
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">{getScoreLabel(score)}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {score >= 80
            ? "Your account has strong security measures"
            : score >= 60
              ? "Consider enabling more security features"
              : "Please enable MFA and passkeys for better security"}
        </p>
      </div>
    </div>
  )
}
