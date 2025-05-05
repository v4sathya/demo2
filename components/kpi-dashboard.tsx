"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, AlertTriangle, XCircle, Download, RefreshCw, Info } from "lucide-react"
import { DepartmentFilter } from "@/components/department-filter"
import { MetricTable } from "@/components/metric-table"
import { MetricScorecard } from "@/components/metric-scorecard"
import { RecommendedKpis } from "@/components/recommended-kpis"
import { ProblematicMetrics } from "@/components/problematic-metrics"
import { MetricUsageChart } from "@/components/metric-usage-chart"
import { DuplicateMetricsChart } from "@/components/duplicate-metrics-chart"
import { fetchAndProcessKpiData } from "@/lib/kpi-processor"
import { CsvUpload } from "@/components/csv-upload"
import { processKpiData } from "@/lib/kpi-processor"
import { ScoringRubricInfo } from "@/components/scoring-rubric-info"

export function KpiDashboard() {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processedData, setProcessedData] = useState<any>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [dataSource, setDataSource] = useState<string>("default")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // If we have CSV data from an upload, use that instead of fetching
        if (csvData) {
          const results = processKpiData(csvData, selectedDepartments)
          setProcessedData(results)

          // Extract unique departments for the filter
          if (results.allMetrics.length > 0) {
            const uniqueDepartments = [...new Set(results.allMetrics.map((metric: any) => metric.department))].sort()
            setDepartments(uniqueDepartments)
          }
        } else {
          // Otherwise use the default fetch method
          const results = await fetchAndProcessKpiData(selectedDepartments)
          setProcessedData(results)

          // Extract unique departments for the filter
          if (results.allMetrics.length > 0) {
            const uniqueDepartments = [...new Set(results.allMetrics.map((metric: any) => metric.department))].sort()
            setDepartments(uniqueDepartments)
          }
        }

        setError(null)
      } catch (err) {
        console.error("Error loading KPI data:", err)
        setError("Failed to load KPI data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedDepartments, csvData])

  const handleDepartmentChange = (departments: string[]) => {
    setSelectedDepartments(departments)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      if (csvData) {
        const results = processKpiData(csvData, selectedDepartments)
        setProcessedData(results)
      } else {
        const results = await fetchAndProcessKpiData(selectedDepartments)
        setProcessedData(results)
      }
      setError(null)
    } catch (err) {
      console.error("Error refreshing KPI data:", err)
      setError("Failed to refresh KPI data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCsvDataLoaded = (data: any[]) => {
    setCsvData(data)
    setDataSource("custom")
    setIsLoading(true)
  }

  const handleExport = () => {
    if (!processedData) return

    // Create CSV content
    const headers =
      "Department,Metric Name,Visible in Dashboard,Used in Decision Making,Executive Requested,Last Reviewed,Metric Last Used For Decision,Interpretation Notes,Score,Issues\n"

    const csvContent = processedData.allMetrics
      .map((metric: any) => {
        return `"${metric.department}","${metric.name}","${metric.visibleInDashboard ? "Yes" : "No"}","${metric.usedInDecisionMaking ? "Yes" : "No"}","${metric.executiveRequested ? "Yes" : "No"}","${metric.lastReviewed}","${metric.lastUsedForDecision}","${metric.interpretation}","${metric.score}","${metric.issues.join(", ")}"`
      })
      .join("\n")

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "kpi_audit_results.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KPI Audit Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Analyze and optimize your organization's key performance indicators
            </p>
          </div>
          <CsvUpload onDataLoaded={handleCsvDataLoaded} />
        </div>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <CsvUpload onDataLoaded={handleCsvDataLoaded} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KPI Audit Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Analyze and optimize your organization's key performance indicators
            {dataSource === "custom" && (
              <Badge variant="outline" className="ml-2">
                Using Custom Data
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CsvUpload onDataLoaded={handleCsvDataLoaded} />
          <DepartmentFilter
            onChange={handleDepartmentChange}
            selectedDepartments={selectedDepartments}
            departments={departments}
          />
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || !processedData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricScorecard
              title="Total KPIs"
              value={processedData.totalKpis}
              description="Across all departments"
              icon={<BarChart className="h-4 w-4 text-blue-500" />}
              trend={{ value: "", label: "" }}
            />
            <MetricScorecard
              title="Redundant Metrics"
              value={processedData.redundantMetrics.length}
              description="Duplicated across departments"
              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
              trend={{ value: "", label: "" }}
            />
            <MetricScorecard
              title="Misleading Metrics"
              value={processedData.misleadingMetrics.length}
              description="Vanity or optics-only metrics"
              icon={<XCircle className="h-4 w-4 text-red-500" />}
              trend={{ value: "", label: "" }}
            />
            <MetricScorecard
              title="Zero-Impact Metrics"
              value={processedData.zeroImpactMetrics.length}
              description="Not used in decision making"
              icon={<Info className="h-4 w-4 text-gray-500" />}
              trend={{ value: "", label: "" }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Metric Usage Analysis</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {selectedDepartments.length
                      ? selectedDepartments.length > 2
                        ? `${selectedDepartments.length} Departments`
                        : selectedDepartments.join(", ")
                      : "All Departments"}
                  </Badge>
                </div>
                <CardDescription>Visualization of metric usage patterns across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <MetricUsageChart data={processedData.metricUsageData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Duplicate Metrics</CardTitle>
                <CardDescription>Metrics that appear in multiple departments</CardDescription>
              </CardHeader>
              <CardContent>
                <DuplicateMetricsChart data={processedData.duplicateMetricsData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recommended KPIs</CardTitle>
                  <ScoringRubricInfo />
                </div>
                <CardDescription>The 3 most impactful KPIs for business outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendedKpis kpis={processedData.recommendedKpis} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Problematic Metrics</CardTitle>
                <CardDescription>Metrics that should be reconsidered or eliminated</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="redundant">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="redundant">Redundant</TabsTrigger>
                    <TabsTrigger value="misleading">Misleading</TabsTrigger>
                    <TabsTrigger value="zero-impact">Zero-Impact</TabsTrigger>
                  </TabsList>
                  <TabsContent value="redundant">
                    <ProblematicMetrics metrics={processedData.redundantMetrics} type="redundant" />
                  </TabsContent>
                  <TabsContent value="misleading">
                    <ProblematicMetrics metrics={processedData.misleadingMetrics} type="misleading" />
                  </TabsContent>
                  <TabsContent value="zero-impact">
                    <ProblematicMetrics metrics={processedData.zeroImpactMetrics} type="zero-impact" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Complete KPI Inventory</CardTitle>
              </div>
              <CardDescription>Comprehensive view of all KPIs with detailed analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <MetricTable metrics={processedData.allMetrics} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
