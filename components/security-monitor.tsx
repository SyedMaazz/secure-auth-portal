"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface SecurityEvent {
  id: string
  type: "login_success" | "login_failed" | "mfa_enabled" | "passkey_added" | "password_changed"
  description: string
  timestamp: string
  risk_level: "low" | "medium" | "high"
}

interface SecurityMonitorProps {
  userId: string
}

export function SecurityMonitor({ userId }: SecurityMonitorProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSecurityEvents = async () => {
      // In a real app, you would fetch actual security events from your database
      // For demo purposes, we'll generate mock events
      const mockEvents: SecurityEvent[] = [
        {
          id: "1",
          type: "login_success",
          description: "Successful login from new device",
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          risk_level: "low",
        },
        {
          id: "2",
          type: "mfa_enabled",
          description: "Multi-factor authentication enabled",
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          risk_level: "low",
        },
        {
          id: "3",
          type: "passkey_added",
          description: "New passkey registered",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          risk_level: "low",
        },
      ]

      setEvents(mockEvents)
      setIsLoading(false)
    }

    if (userId) {
      loadSecurityEvents()
    }
  }, [userId])

  const getEventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "login_success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "login_failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "mfa_enabled":
      case "passkey_added":
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-slate-600" />
    }
  }

  const getRiskBadge = (riskLevel: SecurityEvent["risk_level"]) => {
    switch (riskLevel) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">High Risk</Badge>
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium Risk</Badge>
        )
      case "low":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Low Risk</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle>Security Monitor</CardTitle>
          <CardDescription>Loading security events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitor
        </CardTitle>
        <CardDescription>Recent security events and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent security events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getEventIcon(event.type)}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{event.description}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {getRiskBadge(event.risk_level)}
              </div>
            ))}
          </div>
        )}

        {/* Security Alerts */}
        <div className="mt-6 space-y-3">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              Your account security is excellent. All recommended security features are enabled.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}
