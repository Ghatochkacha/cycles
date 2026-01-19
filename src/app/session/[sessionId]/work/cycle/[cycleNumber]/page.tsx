import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { CycleFlow } from "@/components/session/cycle-flow"

export default async function CyclePage({ params }: { params: { sessionId: string, cycleNumber: string } }) {
  const sessionId = params.sessionId
  const cycleNumber = parseInt(params.cycleNumber)
  
  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
        cycles: {
            where: { cycleNumber },
            include: { plan: true, review: true }
        }
    }
  })

  if (!session) notFound()
  
  // Current cycle data (if any)
  const currentCycle = session.cycles[0]
  
  return (
    <CycleFlow 
      session={session} 
      cycleNumber={cycleNumber} 
      initialCycle={currentCycle} 
    />
  )
}
