import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { EnergyChart } from "@/components/dashboard/energy-chart"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const sessions = await db.session.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { cycles: true }
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

  return (
     <div className="container mx-auto py-10 space-y-8">
       <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold">Dashboard</h1>
         <Link href="/session/new">
           <Button>New Session</Button>
         </Link>
       </div>
       
       <div className="grid gap-4 md:grid-cols-3">
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Sessions</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold">{totalSessions}</CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Cycles</CardTitle></CardHeader>
             <CardContent className="text-2xl font-bold">{totalCycles}</CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completion Rate</CardTitle></CardHeader>
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
