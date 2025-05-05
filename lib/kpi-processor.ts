// This file processes the KPI data from the CSV

interface KpiData {
  Department: string
  Metric_Name: string
  Visible_in_Dashboard: string
  Used_in_Decision_Making: string
  Executive_Requested: string
  Last_Reviewed: string
  Metric_Last_Used_For_Decision: string
  Interpretation_Notes: string
}

interface ProcessedMetric {
  id: string
  name: string
  department: string
  visibleInDashboard: boolean
  usedInDecisionMaking: boolean
  executiveRequested: boolean
  lastReviewed: string
  lastUsedForDecision: string
  interpretation: string
  tiedToGoals: boolean
  score: number
  issues: string[]
}

// Update the fetchAndProcessKpiData function to use the default URL
export async function fetchAndProcessKpiData(selectedDepartments: string[]) {
  try {
    // Fetch the CSV data from the provided URL
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/week%202%20-%20Problem_4_-_Vanity_Metrics_Dashboard__Revised_-BBx5t4ci4Gr3QJRPEKCkbZWLzeJBcm.csv",
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()

    // Parse the CSV data
    const parsedData = parseCSV(csvText)

    // Process the data
    return processKpiData(parsedData, selectedDepartments)
  } catch (error) {
    console.error("Error fetching or processing KPI data:", error)
    throw error
  }
}

function parseCSV(csvText: string): KpiData[] {
  // Split the CSV text into lines
  const lines = csvText.split("\n")

  // Extract the header line and parse it
  const headerLine = lines[0]
  const headers = headerLine.split(",").map((header) => header.trim().replace(/"/g, ""))

  // Parse each data line
  const data: KpiData[] = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue // Skip empty lines

    // Handle commas within quoted fields
    const values: string[] = []
    let currentValue = ""
    let insideQuotes = false

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j]

      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim().replace(/"/g, ""))
        currentValue = ""
      } else {
        currentValue += char
      }
    }

    // Add the last value
    values.push(currentValue.trim().replace(/"/g, ""))

    // Create an object with the headers as keys
    const rowData: any = {}
    headers.forEach((header, index) => {
      rowData[header] = values[index] || ""
    })

    data.push(rowData as KpiData)
  }

  return data
}

// Update the processKpiData function to include all necessary data for score breakdown
export function processKpiData(data: KpiData[], selectedDepartments: string[]) {
  // Filter by selected departments if any are selected
  const filteredData =
    selectedDepartments.length > 0 ? data.filter((item) => selectedDepartments.includes(item.Department)) : data

  // Convert string values to appropriate types
  const processedData = filteredData.map((item, index) => ({
    id: (index + 1).toString(),
    name: item.Metric_Name,
    department: item.Department,
    visibleInDashboard: item.Visible_in_Dashboard.toLowerCase() === "yes",
    usedInDecisionMaking: item.Used_in_Decision_Making.toLowerCase() === "yes",
    executiveRequested: item.Executive_Requested.toLowerCase() === "yes",
    lastReviewed: item.Last_Reviewed,
    lastUsedForDecision: item.Metric_Last_Used_For_Decision,
    interpretation: item.Interpretation_Notes,
    tiedToGoals:
      item.Interpretation_Notes.toLowerCase().includes("goal") ||
      item.Interpretation_Notes.toLowerCase().includes("outcome") ||
      item.Interpretation_Notes.toLowerCase().includes("revenue") ||
      item.Interpretation_Notes.toLowerCase().includes("profit"),
  }))

  // Identify redundant metrics (appearing in multiple departments)
  const metricsByName: Record<string, ProcessedMetric[]> = {}
  processedData.forEach((metric) => {
    if (!metricsByName[metric.name]) {
      metricsByName[metric.name] = []
    }
    metricsByName[metric.name].push(metric)
  })

  const redundantMetrics = Object.entries(metricsByName)
    .filter(([_, metrics]) => metrics.length > 1)
    .flatMap(([name, metrics]) =>
      metrics.map((metric) => ({
        id: metric.id,
        name: metric.name,
        department: metric.department,
        reason: `Appears in ${metrics.length} departments: ${metrics.map((m) => m.department).join(", ")}`,
      })),
    )

  // Identify misleading metrics (marked as "vanity" or "optics only")
  const misleadingMetrics = processedData
    .filter(
      (metric) =>
        metric.interpretation.toLowerCase().includes("vanity") ||
        metric.interpretation.toLowerCase().includes("optic") ||
        metric.interpretation.toLowerCase().includes("look good") ||
        metric.interpretation.toLowerCase().includes("not meaningful") ||
        metric.interpretation.toLowerCase().includes("misleading"),
    )
    .map((metric) => ({
      id: metric.id,
      name: metric.name,
      department: metric.department,
      reason: `Misleading: ${metric.interpretation}`,
    }))

  // Identify zero-impact metrics (not used in decision making)
  const zeroImpactMetrics = processedData
    .filter(
      (metric) =>
        !metric.usedInDecisionMaking ||
        metric.lastUsedForDecision.toLowerCase().includes("never") ||
        metric.lastUsedForDecision.toLowerCase().includes("don't know"),
    )
    .map((metric) => ({
      id: metric.id,
      name: metric.name,
      department: metric.department,
      reason: metric.lastUsedForDecision.toLowerCase().includes("never")
        ? "Never used in decision making"
        : "Not used in decision making",
    }))

  // Calculate metric usage data by department
  const departments = [...new Set(processedData.map((metric) => metric.department))]
  const metricUsageData = departments.map((department) => {
    const departmentMetrics = processedData.filter((metric) => metric.department === department)
    return {
      department,
      usedInDecisions: departmentMetrics.filter((m) => m.usedInDecisionMaking).length,
      notUsedInDecisions: departmentMetrics.filter((m) => !m.usedInDecisionMaking).length,
      visibleInDashboard: departmentMetrics.filter((m) => m.visibleInDashboard).length,
      notVisibleInDashboard: departmentMetrics.filter((m) => !m.visibleInDashboard).length,
    }
  })

  // Calculate duplicate metrics data for pie chart
  const duplicateMetricsData = [
    { name: "Unique", value: Object.keys(metricsByName).length, color: "#3b82f6" },
    { name: "Duplicated", value: redundantMetrics.length, color: "#f97316" },
  ]

  // Score metrics based on various factors
  const scoredMetrics = processedData.map((metric) => {
    let score = 0

    // Metrics used in decision making get points
    if (metric.usedInDecisionMaking) score += 30

    // Metrics tied to goals get points
    if (metric.tiedToGoals) score += 25

    // Metrics visible in dashboards get points
    if (metric.visibleInDashboard) score += 15

    // Add points for executive requested metrics
    if (metric.executiveRequested) score += 10

    // Recently reviewed metrics get points
    if (metric.lastReviewed.toLowerCase().includes("last month")) score += 15
    else if (metric.lastReviewed.toLowerCase().includes("last quarter")) score += 10
    else if (metric.lastReviewed.toLowerCase().includes("last year")) score += 5

    // Recently used for decisions get points
    if (metric.lastUsedForDecision.toLowerCase().includes("last month")) score += 15
    else if (metric.lastUsedForDecision.toLowerCase().includes("last quarter")) score += 10
    else if (metric.lastUsedForDecision.toLowerCase().includes("last year")) score += 5

    // Deduct points for problematic metrics
    const isRedundant = redundantMetrics.some((m) => m.id === metric.id)
    const isMisleading = misleadingMetrics.some((m) => m.id === metric.id)
    const isZeroImpact = zeroImpactMetrics.some((m) => m.id === metric.id)

    if (isRedundant) score -= 15
    if (isMisleading) score -= 25
    if (isZeroImpact) score -= 20

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score))

    // Identify issues
    const issues = []
    if (isRedundant) issues.push("redundant")
    if (isMisleading) issues.push("misleading")
    if (isZeroImpact) issues.push("zero-impact")

    return {
      ...metric,
      score,
      issues,
    }
  })

  // Sort metrics by score
  const sortedMetrics = [...scoredMetrics].sort((a, b) => b.score - a.score)

  // Get top 3 recommended KPIs
  const recommendedKpis = sortedMetrics.slice(0, 3).map((metric) => {
    // Create a more concise justification that's cleaner for display
    let justification = ""

    // Add core value proposition
    if (metric.usedInDecisionMaking && metric.tiedToGoals) {
      justification = `This KPI is actively used in decision making and directly tied to business goals. `
    } else if (metric.usedInDecisionMaking) {
      justification = `This KPI is actively used in decision making. `
    } else if (metric.tiedToGoals) {
      justification = `This KPI is tied to important business goals. `
    }

    // Add a brief note about its visibility and importance
    if (metric.visibleInDashboard && metric.executiveRequested) {
      justification += `It's visible in dashboards and requested by executives. `
    } else if (metric.visibleInDashboard) {
      justification += `It's visible in dashboards for regular monitoring. `
    } else if (metric.executiveRequested) {
      justification += `It's specifically requested by executives. `
    }

    // Add a brief note about recency if applicable
    if (
      metric.lastReviewed.toLowerCase().includes("last month") ||
      (metric.lastUsedForDecision && metric.lastUsedForDecision.toLowerCase().includes("last month"))
    ) {
      justification += `Recently reviewed and used for decision making. `
    }

    // Add the interpretation if it's concise, otherwise summarize
    if (metric.interpretation && metric.interpretation.length < 100) {
      justification += metric.interpretation
    } else if (metric.interpretation) {
      // Extract first sentence or truncate
      const firstSentence = metric.interpretation.split(".")[0]
      justification += firstSentence + "."
    }

    return {
      id: metric.id,
      name: metric.name,
      department: metric.department,
      score: metric.score,
      justification,
      usedInDecisionMaking: metric.usedInDecisionMaking,
      tiedToGoals: metric.tiedToGoals,
      visibleInDashboard: metric.visibleInDashboard,
      lastReviewed: metric.lastReviewed,
      lastUsedForDecision: metric.lastUsedForDecision,
      executiveRequested: metric.executiveRequested,
      issues: metric.issues,
    }
  })

  return {
    totalKpis: filteredData.length,
    redundantMetrics,
    misleadingMetrics,
    zeroImpactMetrics,
    metricUsageData,
    duplicateMetricsData,
    recommendedKpis,
    allMetrics: sortedMetrics,
  }
}
