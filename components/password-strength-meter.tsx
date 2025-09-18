"use client"

import { useState, useEffect } from "react"
import { validatePasswordStrength, isCommonPassword } from "@/lib/utils/security"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X, AlertTriangle } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className = "" }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState({ score: 0, feedback: [], isStrong: false })
  const [isCommon, setIsCommon] = useState(false)

  useEffect(() => {
    if (password) {
      const strengthResult = validatePasswordStrength(password)
      setStrength(strengthResult)
      setIsCommon(isCommonPassword(password))
    } else {
      setStrength({ score: 0, feedback: [], isStrong: false })
      setIsCommon(false)
    }
  }, [password])

  if (!password) return null

  const getStrengthColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getStrengthLabel = (score: number) => {
    if (score >= 80) return "Strong"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Weak"
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Password Strength</span>
          <span className="text-sm text-slate-600 dark:text-slate-400">{getStrengthLabel(strength.score)}</span>
        </div>
        <Progress value={strength.score} className="h-2">
          <div className={`h-full rounded-full transition-all ${getStrengthColor(strength.score)}`} />
        </Progress>
      </div>

      {isCommon && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>This is a commonly used password. Please choose something more unique.</AlertDescription>
        </Alert>
      )}

      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Suggestions:</p>
          {strength.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <X className="h-3 w-3 text-red-500 mr-2" />
              {feedback}
            </div>
          ))}
        </div>
      )}

      {strength.isStrong && (
        <div className="flex items-center text-sm text-green-600">
          <Check className="h-3 w-3 mr-2" />
          Your password meets all security requirements
        </div>
      )}
    </div>
  )
}
