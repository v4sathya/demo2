import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface MetricScorecardProps {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  trend?: {
    value: string
    label: string
  }
}

export function MetricScorecard({ title, value, description, icon, trend }: MetricScorecardProps) {
  const isPositiveTrend = trend?.value.startsWith("+")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && trend.value && (
          <div className="mt-2 flex items-center text-xs">
            {isPositiveTrend ? (
              <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />
            )}
            <span className={isPositiveTrend ? "text-emerald-500" : "text-rose-500"}>{trend.value}</span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
