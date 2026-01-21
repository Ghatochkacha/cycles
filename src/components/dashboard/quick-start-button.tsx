"use client"

import { Button } from "@/components/ui/button"
import { quickStartSession } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Zap } from "lucide-react" // Assuming Zap icon for "Quick"
import { useToast } from "@/hooks/use-toast"

export function QuickStartButton() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleQuickStart = async () => {
    setLoading(true)
    try {
      const result = await quickStartSession()
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success && result.sessionId) {
        toast({
          title: "Session Started",
          description: "Reusing settings from your last session.",
        })
        router.push(`/session/${result.sessionId}/work/cycle/1`)
      }
    } catch (error) {
      toast({
          title: "Error",
          description: "Something went wrong.",
          variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleQuickStart} disabled={loading} className="gap-2">
      <Zap className="w-4 h-4" />
      {loading ? "Starting..." : "Repeat Last Session"}
    </Button>
  )
}
