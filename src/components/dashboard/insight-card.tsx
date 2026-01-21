import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface InsightCardProps {
  title: string
  keywords: { word: string; count: number }[]
  colorClass?: string
}

export function InsightCard({ title, keywords, colorClass = "bg-primary/10 text-primary" }: InsightCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {keywords.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not enough data yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((k, i) => (
              <div 
                key={k.word} 
                className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
                style={{ opacity: Math.max(0.5, 1 - i * 0.08) }} // Fade out less frequent words
              >
                {k.word} <span className="text-xs opacity-70 ml-1">({k.count})</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
