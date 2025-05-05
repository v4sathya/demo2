"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { InfoIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ScoreBreakdownProps {
  kpi: {
    id: string
    name: string
    department: string
    score: number
    usedInDecisionMaking: boolean
    tiedToGoals: boolean
    visibleInDashboard: boolean
    lastReviewed: string
    lastUsedForDecision?: string
    executiveRequested: boolean
    issues: string[]
  }
}

export function ScoreBreakdown({ kpi }: ScoreBreakdownProps) {
  const [open, setOpen] = useState(false)

  // Calculate score components
  const decisionMakingScore = kpi.usedInDecisionMaking ? 30 : 0
  const goalsScore = kpi.tiedToGoals ? 25 : 0
  const visibilityScore = kpi.visibleInDashboard ? 15 : 0
  const executiveRequestedScore = kpi.executiveRequested ? 10 : 0

  // Calculate recency scores
  let recencyScore = 0
  if (kpi.lastReviewed.toLowerCase().includes("last month")) recencyScore += 15
  else if (kpi.lastReviewed.toLowerCase().includes("last quarter")) recencyScore += 10
  else if (kpi.lastReviewed.toLowerCase().includes("last year")) recencyScore += 5

  // Calculate usage scores
  let usageScore = 0
  if (kpi.lastUsedForDecision?.toLowerCase().includes("last month")) usageScore += 15
  else if (kpi.lastUsedForDecision?.toLowerCase().includes("last quarter")) usageScore += 10
  else if (kpi.lastUsedForDecision?.toLowerCase().includes("last year")) usageScore += 5

  // Calculate deductions
  const redundantDeduction = kpi.issues.includes("redundant") ? -15 : 0
  const misleadingDeduction = kpi.issues.includes("misleading") ? -25 : 0
  const zeroImpactDeduction = kpi.issues.includes("zero-impact") ? -20 : 0

  // Total deductions
  const totalDeductions = redundantDeduction + misleadingDeduction + zeroImpactDeduction

  // Calculate total positive score
  const positiveScore =
    decisionMakingScore + goalsScore + visibilityScore + executiveRequestedScore + recencyScore + usageScore

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
          <InfoIcon className="h-4 w-4" />
          <span className="sr-only">Score breakdown</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="mb-4">
          <DialogTitle>Score Breakdown: {kpi.name}</DialogTitle>
          <DialogDescription>How the score of {kpi.score} was calculated for this KPI</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-8 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Total Score: {kpi.score}</h3>
                <span className="text-sm text-muted-foreground">Out of 100</span>
              </div>
              <Progress value={kpi.score} className="h-3" />
            </div>

            <div className="space-y-6">
              <h4 className="font-medium text-base">Positive Factors</h4>
              <div className="space-y-3 pl-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Used in decision making
                    <span className="block text-xs text-muted-foreground mt-1">
                      Based on "Used_in_Decision_Making" field in data
                    </span>
                  </span>
                  <span
                    className={`text-sm font-medium ${decisionMakingScore > 0 ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    +{decisionMakingScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Tied to business goals
                    <span className="block text-xs text-muted-foreground mt-1">
                      Based on goal/outcome keywords in interpretation notes
                    </span>
                  </span>
                  <span
                    className={`text-sm font-medium ${goalsScore > 0 ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    +{goalsScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Visible in dashboards
                    <span className="block text-xs text-muted-foreground mt-1">
                      Based on "Visible_in_Dashboard" field in data
                    </span>
                  </span>
                  <span
                    className={`text-sm font-medium ${visibilityScore > 0 ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    +{visibilityScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Executive requested
                    <span className="block text-xs text-muted-foreground mt-1">
                      Based on "Executive_Requested" field in data
                    </span>
                  </span>
                  <span
                    className={`text-sm font-medium ${executiveRequestedScore > 0 ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    +{executiveRequestedScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Recently reviewed
                    <span className="block text-xs text-muted-foreground mt-1">
                      Based on "Last_Reviewed" field in data
                    </span>
                  </span>
                  <span
                    className={`text-sm font-medium ${recencyScore > 0 ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    +{recencyScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    Recently used for decisions
                    <span className="block text-xs text-muted-foreground mt-1">
                      Based on "Metric_Last_Used_For_Decision" field in data
                    </span>
                  </span>
                  <span
                    className={`text-sm font-medium ${usageScore > 0 ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    +{usageScore}
                  </span>
                </div>
                <div className="flex justify-between items-center font-medium pt-3 border-t">
                  <span>Subtotal</span>
                  <span className="text-green-500">+{positiveScore}</span>
                </div>
              </div>
            </div>

            {totalDeductions !== 0 && (
              <div className="space-y-6">
                <h4 className="font-medium text-base">Negative Factors</h4>
                <div className="space-y-3 pl-2">
                  {redundantDeduction !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Redundant metric (appears in multiple departments)
                        <span className="block text-xs text-muted-foreground mt-1">
                          Metrics with the same name in different departments
                        </span>
                      </span>
                      <span className="text-sm font-medium text-red-500">{redundantDeduction}</span>
                    </div>
                  )}
                  {misleadingDeduction !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Misleading metric
                        <span className="block text-xs text-muted-foreground mt-1">
                          Based on interpretation notes indicating vanity metrics
                        </span>
                      </span>
                      <span className="text-sm font-medium text-red-500">{misleadingDeduction}</span>
                    </div>
                  )}
                  {zeroImpactDeduction !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Zero-impact metric
                        <span className="block text-xs text-muted-foreground mt-1">
                          Not used in decision making or never used
                        </span>
                      </span>
                      <span className="text-sm font-medium text-red-500">{zeroImpactDeduction}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-medium pt-3 border-t">
                    <span>Subtotal</span>
                    <span className="text-red-500">{totalDeductions}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-bold">
                <span>Final Score</span>
                <span>{kpi.score}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Score is calculated by adding positive factors and subtracting negative factors, then clamping the
                result between 0 and 100. Redundant metrics are identified when the same metric name appears in multiple
                departments.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
