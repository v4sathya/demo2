import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, TrendingUp, BarChart3 } from "lucide-react"
import { ScoreBreakdown } from "@/components/score-breakdown"

interface RecommendedKpi {
  id: string
  name: string
  department: string
  score: number
  justification: string
  usedInDecisionMaking: boolean
  tiedToGoals: boolean
  visibleInDashboard: boolean
  lastReviewed: string
  lastUsedForDecision?: string
  executiveRequested: boolean
  issues: string[]
}

interface RecommendedKpisProps {
  kpis: RecommendedKpi[]
}

export function RecommendedKpis({ kpis }: RecommendedKpisProps) {
  const getIcon = (index: number) => {
    switch (index) {
      case 0:
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 1:
        return <BarChart3 className="h-5 w-5 text-blue-500" />
      case 2:
        return <CheckCircle className="h-5 w-5 text-purple-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  return (
    <div className="space-y-4">
      {kpis.map((kpi, index) => (
        <Card
          key={kpi.id}
          className="border-l-4"
          style={{ borderLeftColor: index === 0 ? "#22c55e" : index === 1 ? "#3b82f6" : "#a855f7" }}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base flex items-center">
                  {getIcon(index)}
                  <span className="ml-2">{kpi.name}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  <Badge variant="outline" className="mr-1">
                    {kpi.department}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Score: {kpi.score}
                    <ScoreBreakdown kpi={kpi} />
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{kpi.justification}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
