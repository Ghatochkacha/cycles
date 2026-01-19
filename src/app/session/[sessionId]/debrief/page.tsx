import { DebriefForm } from "@/components/session/debrief-form"

export default function DebriefPage({ params }: { params: { sessionId: string } }) {
  return (
    <div className="container mx-auto">
      <DebriefForm sessionId={params.sessionId} />
    </div>
  )
}
