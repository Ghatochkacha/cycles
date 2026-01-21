import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { EnergyChart } from "@/components/dashboard/energy-chart"
import { calculateStreak } from "@/lib/stats"
import { Flame } from "lucide-react"
import { QuickStartButton } from "@/components/dashboard/quick-start-button"
import { SessionCard } from "@/components/dashboard/session-card"
import { extractKeywords } from "@/lib/analytics"
import { InsightCard } from "@/components/dashboard/insight-card"
import { SiteHeader } from "@/components/layout/site-header"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const sessions = await db.session.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { 
      cycles: {
        include: { review: true, plan: true }
      } 
    }
  })

  const cyclesWithPlans = await db.cycle.findMany({
    where: { 
        session: { userId: session.user.id },
        plan: { isNot: null }
    },
    include: { plan: true },
    orderBy: { createdAt: 'asc' },
    take: 20 
  })
  
  const chartData = cyclesWithPlans.map(c => ({
      date: c.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      energy: c.plan?.energyLevel === 'high' ? 3 : c.plan?.energyLevel === 'medium' ? 2 : 1,
      morale: c.plan?.moraleLevel === 'high' ? 3 : c.plan?.moraleLevel === 'medium' ? 2 : 1,
  }))

  const totalSessions = sessions.filter(s => s.status === 'completed').length
  const totalCycles = sessions.reduce((acc, s) => acc + s.cycles.filter(c => c.status === 'completed').length, 0)
  
  // Calculate Target Hit Rate & Golden Hour
  const cyclesWithReviews = sessions.flatMap(s => s.cycles).filter(c => c.review)
  const successfulCycles = cyclesWithReviews.filter(c => c.review?.completedTarget).length
  const hitRate = cyclesWithReviews.length > 0 
    ? Math.round((successfulCycles / cyclesWithReviews.length) * 100) 
    : 0
  
  // Golden Hour Calculation
  const hoursMap = new Map<number, { total: number, success: number }>()
  cyclesWithReviews.forEach(c => {
    const hour = c.createdAt.getHours()
    const current = hoursMap.get(hour) || { total: 0, success: 0 }
    hoursMap.set(hour, {
      total: current.total + 1,
      success: current.success + (c.review?.completedTarget ? 1 : 0)
    })
  })

  let bestHour = -1
  let bestRate = -1
  
  hoursMap.forEach((stats, hour) => {
    if (stats.total >= 3) { // Minimum 3 cycles to be significant
      const rate = stats.success / stats.total
      if (rate > bestRate) {
        bestRate = rate
        bestHour = hour
      }
    }
  })
  
  const goldenHourText = bestHour !== -1 
     ? `${bestHour}:00 - ${bestHour + 1}:00` 
     : "Not enough data"

  const streak = calculateStreak(sessions)

  // Deep Text Analytics
  const allPlans = sessions.flatMap(s => s.cycles).map(c => c.plan)
  const allReviews = sessions.flatMap(s => s.cycles).map(c => c.review)
  
  // 1. Wins (What do you accomplish?)
  const winTexts = [
    ...sessions.map(s => (s.preparationAnswers as any)?.q1_accomplish),
    ...allPlans.map(p => p?.goal)
  ]
  const winKeywords = extractKeywords(winTexts)

  // 2. Blockers (Hazards + Distractions + Bogged Down)
  const blockerTexts = [
      ...sessions.map(s => (s.preparationAnswers as any)?.q4_hazards),
      ...sessions.map(s => (s.debriefAnswers as any)?.q3_bogged),
      ...allPlans.map(p => p?.hazards),
      ...allReviews.map(r => r?.distractions)
  ]
  const blockerKeywords = extractKeywords(blockerTexts)

  // 3. Lessons (Improvements + Takeaways)
  const lessonTexts = [
      ...sessions.map(s => (s.debriefAnswers as any)?.q5_takeaways),
      ...allReviews.map(r => r?.improvements)
  ]
  const lessonKeywords = extractKeywords(lessonTexts)

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <div className="container mx-auto py-10 space-y-8">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold">Dashboard</h1>
         <div className="flex items-center gap-4">
           {streak > 0 && (
             <div className="flex items-center gap-2 text-orange-500 font-medium bg-orange-50 px-3 py-1 rounded-full dark:bg-orange-950/30">
               <Flame className="w-5 h-5 fill-orange-500" />
               <span>{streak} Day Streak</span>
             </div>
           )}
           {sessions.length > 0 && <QuickStartButton />}
           <Link href="/session/new">
             <Button>New Session</Button>
           </Link>
         </div>
       </div>
       
       <div className="grid gap-4 md:grid-cols-4">
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Sessions</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold">{totalSessions}</CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Cycles</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold">{totalCycles}</CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Target Hit Rate</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold text-green-600 dark:text-green-400">
               {hitRate}%
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Session Completion</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold">
               {sessions.length > 0 
                 ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100) 
                 : 0}%
             </CardContent>
          </Card>
       </div>
       
       <EnergyChart data={chartData} />

       <div className="space-y-4">
         <h2 className="text-2xl font-semibold">Deep Insights</h2>
         <div className="grid gap-4 md:grid-cols-3">
            <InsightCard 
                title="Common Wins" 
                keywords={winKeywords} 
                colorClass="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            />
            <InsightCard 
                title="Top Blockers" 
                keywords={blockerKeywords} 
                colorClass="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
            />
             <InsightCard 
                title="Recurring Lessons" 
                keywords={lessonKeywords} 
                colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
            />
         </div>
       </div>

       <div className="space-y-4">
         <h2 className="text-2xl font-semibold">History</h2>
         {sessions.length === 0 ? (
           <p className="text-muted-foreground">No sessions yet. Start one!</p>
         ) : (
           sessions.map(s => (
            <SessionCard key={s.id} session={s} />
           ))
         )}
       </div>
      </div>
     </div>
  )
}