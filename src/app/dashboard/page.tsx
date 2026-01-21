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

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const sessions = await db.session.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { 
      cycles: {
        include: { review: true }
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

  return (
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
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Target Hit Rate</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold text-green-600 dark:text-green-400">
               {hitRate}%
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Golden Hour</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold text-amber-600 dark:text-amber-400">
               {goldenHourText}
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
         <h2 className="text-2xl font-semibold">History</h2>
         {sessions.length === 0 ? (
           <p className="text-muted-foreground">No sessions yet. Start one!</p>
         ) : (
           sessions.map(s => (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                   <div>
                     <CardTitle className="text-lg">
                        {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                     </CardTitle>
                     <CardDescription>
                        {s.cycles.length} / {s.totalCycles} cycles planned
                     </CardDescription>
                   </div>
                   <div className={`px-2 py-1 rounded text-sm capitalize ${
                       s.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                       s.status === 'abandoned' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                       'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                   }`}>
                       {s.status.replace('_', ' ')}
                   </div>
                </div>
              </CardHeader>
            </Card>
           ))
         )}
       </div>
     </div>
  )
}
