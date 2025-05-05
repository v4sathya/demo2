"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, AlertTriangle, Search, ArrowUpDown, Info, Filter, X, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Metric {
  id: string
  name: string
  department: string
  visibleInDashboard: boolean
  usedInDecisionMaking: boolean
  executiveRequested: boolean
  lastReviewed: string
  lastUsedForDecision: string
  interpretation: string
  score: number
  issues: string[]
}

interface MetricTableProps {
  metrics: Metric[]
}

export function MetricTable({ metrics }: MetricTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Metric>("score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filters, setFilters] = useState<{
    departments: string[]
    visibleInDashboard: boolean | null
    usedInDecisionMaking: boolean | null
    executiveRequested: boolean | null
    issues: string[]
    minScore: number | null
    maxScore: number | null
  }>({
    departments: [],
    visibleInDashboard: null,
    usedInDecisionMaking: null,
    executiveRequested: null,
    issues: [],
    minScore: null,
    maxScore: null,
  })

  // Get unique departments for filter
  const departments = useMemo(() => {
    return [...new Set(metrics.map((metric) => metric.department))].sort()
  }, [metrics])

  const handleSort = (field: keyof Metric) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      // Text search
      const matchesSearch =
        searchTerm === "" ||
        metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.interpretation.toLowerCase().includes(searchTerm.toLowerCase())

      // Department filter
      const matchesDepartment = filters.departments.length === 0 || filters.departments.includes(metric.department)

      // Boolean filters
      const matchesVisibility =
        filters.visibleInDashboard === null || metric.visibleInDashboard === filters.visibleInDashboard

      const matchesDecisionMaking =
        filters.usedInDecisionMaking === null || metric.usedInDecisionMaking === filters.usedInDecisionMaking

      const matchesExecutiveRequested =
        filters.executiveRequested === null || metric.executiveRequested === filters.executiveRequested

      // Issues filter
      const matchesIssues = filters.issues.length === 0 || filters.issues.some((issue) => metric.issues.includes(issue))

      // Score range filter
      const matchesMinScore = filters.minScore === null || metric.score >= filters.minScore
      const matchesMaxScore = filters.maxScore === null || metric.score <= filters.maxScore

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesVisibility &&
        matchesDecisionMaking &&
        matchesExecutiveRequested &&
        matchesIssues &&
        matchesMinScore &&
        matchesMaxScore
      )
    })
  }, [metrics, searchTerm, filters])

  const sortedMetrics = useMemo(() => {
    return [...filteredMetrics].sort((a, b) => {
      if (sortField === "score" || sortField === "id") {
        return sortDirection === "asc"
          ? Number(a[sortField]) - Number(b[sortField])
          : Number(b[sortField]) - Number(a[sortField])
      }

      if (typeof a[sortField] === "boolean") {
        return sortDirection === "asc"
          ? Number(a[sortField]) - Number(b[sortField])
          : Number(b[sortField]) - Number(a[sortField])
      }

      return sortDirection === "asc"
        ? String(a[sortField]).localeCompare(String(b[sortField]))
        : String(b[sortField]).localeCompare(String(a[sortField]))
    })
  }, [filteredMetrics, sortField, sortDirection])

  const getIssueIcon = (issue: string) => {
    switch (issue) {
      case "redundant":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "misleading":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "zero-impact":
        return <Info className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const resetFilters = () => {
    setFilters({
      departments: [],
      visibleInDashboard: null,
      usedInDecisionMaking: null,
      executiveRequested: null,
      issues: [],
      minScore: null,
      maxScore: null,
    })
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.departments.length > 0) count++
    if (filters.visibleInDashboard !== null) count++
    if (filters.usedInDecisionMaking !== null) count++
    if (filters.executiveRequested !== null) count++
    if (filters.issues.length > 0) count++
    if (filters.minScore !== null || filters.maxScore !== null) count++
    return count
  }, [filters])

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center w-full sm:w-auto">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Search metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Departments</Label>
                <ScrollArea className="h-32 border rounded-md p-2">
                  {departments.map((department) => (
                    <div key={department} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`department-${department}`}
                        checked={filters.departments.includes(department)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({
                              ...filters,
                              departments: [...filters.departments, department],
                            })
                          } else {
                            setFilters({
                              ...filters,
                              departments: filters.departments.filter((d) => d !== department),
                            })
                          }
                        }}
                      />
                      <label
                        htmlFor={`department-${department}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {department}
                      </label>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Visible in Dashboard</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                          {filters.visibleInDashboard === null ? "Any" : filters.visibleInDashboard ? "Yes" : "No"}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilters({ ...filters, visibleInDashboard: null })}>
                          Any
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({ ...filters, visibleInDashboard: true })}>
                          Yes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({ ...filters, visibleInDashboard: false })}>
                          No
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Used in Decision Making</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between">
                          {filters.usedInDecisionMaking === null ? "Any" : filters.usedInDecisionMaking ? "Yes" : "No"}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setFilters({ ...filters, usedInDecisionMaking: null })}>
                          Any
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({ ...filters, usedInDecisionMaking: true })}>
                          Yes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilters({ ...filters, usedInDecisionMaking: false })}>
                          No
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issues</Label>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="issue-redundant"
                      checked={filters.issues.includes("redundant")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({
                            ...filters,
                            issues: [...filters.issues, "redundant"],
                          })
                        } else {
                          setFilters({
                            ...filters,
                            issues: filters.issues.filter((i) => i !== "redundant"),
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor="issue-redundant"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Redundant
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="issue-misleading"
                      checked={filters.issues.includes("misleading")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({
                            ...filters,
                            issues: [...filters.issues, "misleading"],
                          })
                        } else {
                          setFilters({
                            ...filters,
                            issues: filters.issues.filter((i) => i !== "misleading"),
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor="issue-misleading"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Misleading
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="issue-zero-impact"
                      checked={filters.issues.includes("zero-impact")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({
                            ...filters,
                            issues: [...filters.issues, "zero-impact"],
                          })
                        } else {
                          setFilters({
                            ...filters,
                            issues: filters.issues.filter((i) => i !== "zero-impact"),
                          })
                        }
                      }}
                    />
                    <label
                      htmlFor="issue-zero-impact"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Zero-Impact
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Score Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Min</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={filters.minScore !== null ? filters.minScore : ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                        setFilters({ ...filters, minScore: value })
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={filters.maxScore !== null ? filters.maxScore : ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : Number.parseInt(e.target.value)
                        setFilters({ ...filters, maxScore: value })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">
          Showing {sortedMetrics.length} of {metrics.length} metrics
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
            <X className="h-3 w-3 mr-1" />
            Clear all filters
          </Button>
        )}
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Button variant="ghost" onClick={() => handleSort("id")} className="-ml-4">
                  ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("name")} className="-ml-4">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("department")} className="-ml-4">
                  Department
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="-ml-4">
                      Dashboard
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, visibleInDashboard: null })}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, visibleInDashboard: true })}>
                      Yes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, visibleInDashboard: false })}>
                      No
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="-ml-4">
                      Decision Making
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, usedInDecisionMaking: null })}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, usedInDecisionMaking: true })}>
                      Yes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, usedInDecisionMaking: false })}>
                      No
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="-ml-4">
                      Executive
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, executiveRequested: null })}>
                      All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, executiveRequested: true })}>
                      Yes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, executiveRequested: false })}>
                      No
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("lastReviewed")} className="-ml-4">
                  Last Reviewed
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Interpretation</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("score")} className="-ml-4">
                  Score
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="-ml-4">
                      Issues
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, issues: [] })}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, issues: ["redundant"] })}>
                      Redundant
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, issues: ["misleading"] })}>
                      Misleading
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilters({ ...filters, issues: ["zero-impact"] })}>
                      Zero-Impact
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMetrics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-24 text-center">
                  No metrics found.
                </TableCell>
              </TableRow>
            ) : (
              sortedMetrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">{metric.id}</TableCell>
                  <TableCell>{metric.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{metric.department}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {metric.visibleInDashboard ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {metric.usedInDecisionMaking ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {metric.executiveRequested ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>{metric.lastReviewed}</TableCell>
                  <TableCell>{metric.lastUsedForDecision}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={metric.interpretation}>
                    {metric.interpretation}
                  </TableCell>
                  <TableCell>
                    <Badge variant={metric.score > 70 ? "default" : metric.score > 40 ? "secondary" : "destructive"}>
                      {metric.score}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {metric.issues.map((issue, index) => (
                        <div key={index} title={issue}>
                          {getIssueIcon(issue)}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
