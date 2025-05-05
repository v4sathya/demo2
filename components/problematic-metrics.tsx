import { AlertTriangle, XCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProblematicMetric {
  id: string
  name: string
  department: string
  reason: string
}

interface ProblematicMetricsProps {
  metrics: ProblematicMetric[]
  type: "redundant" | "misleading" | "zero-impact"
}

export function ProblematicMetrics({ metrics, type }: ProblematicMetricsProps) {
  const getIcon = () => {
    switch (type) {
      case "redundant":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "misleading":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "zero-impact":
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeDescription = () => {
    switch (type) {
      case "redundant":
        return "Metrics that appear in multiple departments, causing confusion and inconsistency"
      case "misleading":
        return "Metrics that don't accurately represent business performance or outcomes"
      case "zero-impact":
        return "Metrics that aren't used for decision making or driving business outcomes"
    }
  }

  if (metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No {type} metrics found.
      </div>
    )
  }

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-4">{getTypeDescription()}</div>
      <ScrollArea className="h-[485px]">
        <div className="space-y-4 pr-4 pb-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="border-l-4 rounded-md p-3 bg-card"
              style={{
                borderLeftColor: type === "redundant" ? "#f59e0b" : type === "misleading" ? "#ef4444" : "#6b7280",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon()}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{metric.name}</div>
                    <Badge variant="outline">{metric.department}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {metric.reason || `Appears in multiple departments`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
