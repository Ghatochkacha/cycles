"use client"

import { useTimer } from "@/hooks/use-timer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pause, Play, CheckCircle } from "lucide-react"
import { useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { sendNotification, requestNotificationPermission } from "@/lib/notifications"

interface CycleTimerProps {
  durationMinutes: number
  onComplete: () => void
  label?: string
}

export function CycleTimer({ durationMinutes, onComplete, label = "Work Cycle" }: CycleTimerProps) {
  const durationSeconds = durationMinutes * 60
  
  const handleComplete = () => {
      sendNotification(`${label} Completed!`, { body: "Time to move to the next step." })
      
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 440
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1)
        osc.start()
        osc.stop(ctx.currentTime + 1)
      } catch (e) {
        // Ignore audio errors
      }

      onComplete()
  }
  
  const { timeRemaining, isRunning, start, pause, resume } = useTimer(durationSeconds, handleComplete)

  useEffect(() => {
    requestNotificationPermission()
    start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  const progress = ((durationSeconds - timeRemaining) / durationSeconds) * 100
  
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <Card className="max-w-md mx-auto text-center">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-8xl font-mono font-bold tabular-nums">
          {formattedTime}
        </div>
        
        <Progress value={progress} className="h-4" />
        
        <div className="flex justify-center gap-4">
          {!isRunning && timeRemaining < durationSeconds ? (
            <Button size="lg" onClick={resume} className="w-32">
              <Play className="mr-2 h-4 w-4" /> Resume
            </Button>
          ) : isRunning ? (
             <Button size="lg" variant="outline" onClick={pause} className="w-32">
              <Pause className="mr-2 h-4 w-4" /> Pause
            </Button>
          ) : (
             <Button size="lg" onClick={() => start()} className="w-32">
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          )}
          
          <Button size="lg" variant="secondary" onClick={onComplete}>
            <CheckCircle className="mr-2 h-4 w-4" /> Finish
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
