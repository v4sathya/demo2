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
import { InfoIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ScoringRubricInfo() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
          <InfoIcon className="h-4 w-4" />
          <span className="sr-only">Scoring Rubric Information</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>KPI Scoring Rubric</DialogTitle>
          <DialogDescription>How KPI scores are calculated in this dashboard</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <Tabs defaultValue="positive">
            <TabsList className="mb-4">
              <TabsTrigger value="positive">Positive Factors</TabsTrigger>
              <TabsTrigger value="negative">Negative Factors</TabsTrigger>
              <TabsTrigger value="calculation">Score Calculation</TabsTrigger>
            </TabsList>

            <TabsContent value="positive" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Used in Decision Making (+30 points)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> "Used_in_Decision_Making" field = "Yes"
                    </li>
                    <li>
                      <span className="font-medium">Importance:</span> KPIs that actively inform decisions have the
                      highest value, as they directly impact business operations and strategy.
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> A "Conversion Rate" metric that marketing teams use
                      to adjust campaign strategies.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Tied to Business Goals (+25 points)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> Interpretation notes containing keywords like
                      "goal", "outcome", "revenue", or "profit"
                    </li>
                    <li>
                      <span className="font-medium">Importance:</span> Metrics aligned with organizational objectives
                      ensure teams focus on what matters most to the business.
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> "Monthly Recurring Revenue" that's directly tied to
                      growth targets.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Visible in Dashboards (+15 points)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> "Visible_in_Dashboard" field = "Yes"
                    </li>
                    <li>
                      <span className="font-medium">Importance:</span> Metrics that are regularly visible to teams
                      promote awareness and accountability.
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> "Customer Satisfaction Score" displayed on support
                      team dashboards.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">4. Executive Requested (+10 points)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> "Executive_Requested" field = "Yes"
                    </li>
                    <li>
                      <span className="font-medium">Importance:</span> Metrics requested by leadership typically have
                      organizational visibility and importance.
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> "Cash Runway" metric requested by the CFO for
                      financial planning.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">5. Recently Reviewed</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> "Last_Reviewed" field
                    </li>
                    <li>
                      <span className="font-medium">Importance:</span> Regularly reviewed metrics remain relevant and
                      accurate.
                    </li>
                    <li>
                      <span className="font-medium">Point Values:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Last month: +15 points</li>
                        <li>Last quarter: +10 points</li>
                        <li>Last year: +5 points</li>
                      </ul>
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> A "Customer Lifetime Value" metric reviewed within
                      the last month.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">6. Recently Used for Decisions</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> "Metric_Last_Used_For_Decision" field
                    </li>
                    <li>
                      <span className="font-medium">Importance:</span> Metrics actively used for recent decisions
                      demonstrate ongoing value.
                    </li>
                    <li>
                      <span className="font-medium">Point Values:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Last month: +15 points</li>
                        <li>Last quarter: +10 points</li>
                        <li>Last year: +5 points</li>
                      </ul>
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> "Churn Rate" used last month to adjust retention
                      strategies.
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="negative" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">1. Misleading Metrics (-25 points)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> Interpretation notes containing keywords like
                      "vanity", "optics", "look good", "not meaningful", or "misleading"
                    </li>
                    <li>
                      <span className="font-medium">Problem:</span> These metrics can drive incorrect conclusions or
                      behaviors that don't benefit the business.
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> "Page Views" that don't correlate with business
                      outcomes but make reports look impressive.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">2. Zero-Impact Metrics (-20 points)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> "Used_in_Decision_Making" = "No" OR
                      "Metric_Last_Used_For_Decision" contains "never" or "don't know"
                    </li>
                    <li>
                      <span className="font-medium">Problem:</span> Metrics that don't influence decisions waste
                      resources in collection and reporting.
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> "Number of Blog Posts" tracked but not used to
                      inform content strategy.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">3. Redundant Metrics (-15 points)</h3>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>
                      <span className="font-medium">Data Source:</span> Same metric name appears in multiple departments
                    </li>
                    <li>
                      <span className="font-medium">Problem:</span> Creates confusion, inconsistency, and inefficiency
                      when different teams track the same thing.
                    </li>
                    <li>
                      <span className="font-medium">Example:</span> Both Sales and Marketing tracking "Customer
                      Acquisition Cost" potentially with different calculations.
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calculation" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Score Calculation</h3>
                <p className="text-sm mb-4">The final score is calculated by:</p>
                <ol className="list-decimal pl-6 space-y-1 text-sm mb-4">
                  <li>Adding all positive factor points</li>
                  <li>Subtracting all negative factor points</li>
                  <li>Clamping the result between 0 and 100</li>
                </ol>
                <p className="text-sm mb-4">
                  This balanced approach ensures that KPIs are evaluated both on their positive contributions and
                  potential issues, providing a comprehensive assessment of each metric's value to the organization.
                </p>

                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">A high-scoring KPI (80-100) typically:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Drives decision making</li>
                      <li>Aligns with business goals</li>
                      <li>Is regularly reviewed and used</li>
                      <li>Has no redundancy or misleading characteristics</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">A low-scoring KPI (0-40) typically:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Isn't used for decisions</li>
                      <li>May be misleading or redundant</li>
                      <li>Hasn't been reviewed recently</li>
                      <li>Doesn't connect to business outcomes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
