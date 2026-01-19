"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CyclePlanner } from "./cycle-planner"
import { CycleTimer } from "./cycle-timer"
import { CycleReviewer } from "./cycle-reviewer"
import { BreakTimer } from "./break-timer"

interface CycleFlowProps {
  session: any
  cycleNumber: number
  initialCycle: any
}

export function CycleFlow({ session, cycleNumber, initialCycle }: CycleFlowProps) {
  const router = useRouter()
  
  const [phase, setPhase] = useState<'planning' | 'working' | 'reviewing' | 'breaking'>('planning')
  const [cycleId, setCycleId] = useState<string | null>(initialCycle?.id || null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Initial state logic
    if (initialCycle) {
       if (initialCycle.status === 'in_progress') {
         const savedState = localStorage.getItem(`cycle-${session.id}-${cycleNumber}`)
         if (savedState) {
            const parsed = JSON.parse(savedState)
            if (parsed.phase && ['working', 'reviewing', 'breaking'].includes(parsed.phase)) {
                setPhase(parsed.phase)
                return
            }
         }
         setPhase('working')
       } else if (initialCycle.status === 'completed') {
           setPhase('breaking')
       }
    } else {
        setPhase('planning')
    }
  }, [initialCycle, session.id, cycleNumber])

  // Persist phase
  useEffect(() => {
    if (isClient) {
        localStorage.setItem(`cycle-${session.id}-${cycleNumber}`, JSON.stringify({ phase }))
    }
  }, [phase, session.id, cycleNumber, isClient])

  const handlePlanComplete = (id: string) => {
    setCycleId(id)
    setPhase('working')
  }

  const handleWorkComplete = () => {
    setPhase('reviewing')
  }

  const handleReviewComplete = () => {
    setPhase('breaking')
  }

  const handleBreakComplete = () => {
    // Navigate to next cycle or debrief
    if (cycleNumber < session.totalCycles) {
      router.push(`/session/${session.id}/work/cycle/${cycleNumber + 1}`)
    } else {
      router.push(`/session/${session.id}/debrief`)
    }
  }

  if (!isClient) return null // Prevent hydration mismatch

  if (phase === 'planning') {
    return <CyclePlanner sessionId={session.id} cycleNumber={cycleNumber} onComplete={handlePlanComplete} />
  }

  if (phase === 'working') {
    return (
      <div className="container mx-auto py-10">
        <CycleTimer 
          durationMinutes={session.cycleDurationMinutes} 
          onComplete={handleWorkComplete} 
        />
      </div>
    )
  }

  if (phase === 'reviewing') {
    return (
      <div className="container mx-auto py-10">
        <CycleTimer 
          durationMinutes={session.cycleDurationMinutes} 
          onComplete={() => {}} 
          label="Work Cycle (Finished)"
        />
        <CycleReviewer 
          cycleId={cycleId!} 
          open={true}
          onComplete={handleReviewComplete}
        />
      </div>
    )
  }

  if (phase === 'breaking') {
    return (
      <div className="container mx-auto py-10">
        <BreakTimer 
           durationMinutes={session.breakDurationMinutes} 
           onComplete={handleBreakComplete} 
        />
      </div>
    )
  }

  return null
}
