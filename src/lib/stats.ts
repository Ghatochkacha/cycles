import { Session } from "@prisma/client"
import { isSameDay, subDays, startOfDay } from "date-fns"

export function calculateStreak(sessions: Session[]): number {
  if (!sessions.length) return 0

  // Filter for completed sessions and sort by date descending (newest first)
  const completedSessions = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (completedSessions.length === 0) return 0

  let streak = 0
  const today = startOfDay(new Date())
  const yesterday = subDays(today, 1)
  
  // Check if the most recent session was today or yesterday
  const lastSessionDate = startOfDay(new Date(completedSessions[0].createdAt))
  
  if (!isSameDay(lastSessionDate, today) && !isSameDay(lastSessionDate, yesterday)) {
    return 0
  }

  // Count backwards
  let checkDate = lastSessionDate
  
  // We already know the first one is valid, so start streak at 1
  // But we need to handle the case where there are multiple sessions on the same day
  // So we iterate through days, checking if a session exists for that day
  
  // Simplified approach: Unique days set
  const sessionDays = new Set(
      completedSessions.map(s => startOfDay(new Date(s.createdAt)).getTime())
  )

  // If the last session was today, start checking from today. 
  // If the last session was yesterday, start checking from yesterday.
  let currentDateToCheck = lastSessionDate

  while (sessionDays.has(currentDateToCheck.getTime())) {
      streak++
      currentDateToCheck = subDays(currentDateToCheck, 1)
  }

  return streak
}
