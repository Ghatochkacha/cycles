"use client"

import { CycleTimer } from "./cycle-timer"

interface BreakTimerProps {
  durationMinutes: number
  onComplete: () => void
}

export function BreakTimer({ durationMinutes, onComplete }: BreakTimerProps) {
  return (
    <CycleTimer 
      durationMinutes={durationMinutes} 
      onComplete={onComplete} 
      label="Break Time"
    />
  )
}
