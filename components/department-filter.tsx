"use client"

import { useState, useEffect } from "react"
import { Filter, X, ChevronDown, Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface DepartmentFilterProps {
  onChange: (departments: string[]) => void
  selectedDepartments: string[]
  departments: string[]
}

export function DepartmentFilter({ onChange, selectedDepartments, departments }: DepartmentFilterProps) {
  // Internal state for popover open/close
  const [open, setOpen] = useState(false)

  // Internal state for search query
  const [searchQuery, setSearchQuery] = useState("")

  // Internal state for selected departments - completely independent from parent
  const [internalSelected, setInternalSelected] = useState<string[]>([])

  // Sync internal state with parent state when popover opens
  useEffect(() => {
    if (open) {
      setInternalSelected([...selectedDepartments])
    }
  }, [open, selectedDepartments])

  // When popover closes, update parent state with internal selections
  const handleOpenChange = (newOpen: boolean) => {
    if (open && !newOpen) {
      // Popover is closing, update parent state
      onChange([...internalSelected])
    }
    setOpen(newOpen)
  }

  // Filter departments based on search query ONLY - never by selection
  const filteredDepartments = departments.filter((department) =>
    department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Toggle selection of a single department
  const handleToggleDepartment = (department: string) => {
    setInternalSelected((prev) =>
      prev.includes(department) ? prev.filter((d) => d !== department) : [...prev, department],
    )
  }

  // Select all departments
  const handleSelectAll = () => {
    setInternalSelected([...departments])
  }

  // Clear all selections
  const handleClear = () => {
    setInternalSelected([])
  }

  // Remove a single department from selection
  const handleRemoveDepartment = (department: string) => {
    setInternalSelected((prev) => prev.filter((d) => d !== department))
  }

  // Apply current selections and close popover
  const handleApply = () => {
    onChange([...internalSelected])
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed">
          <Filter className="mr-2 h-4 w-4" />
          {selectedDepartments.length > 0 ? (
            <>
              {selectedDepartments.length === 1 ? selectedDepartments[0] : `${selectedDepartments.length} Departments`}
              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                {selectedDepartments.length}
              </Badge>
            </>
          ) : (
            "All Departments"
          )}
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filter by Department</h4>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-8 px-2 text-xs">
                <Check className="h-3 w-3 mr-1" />
                All
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>

          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((department) => (
                  <div key={department} className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${department}`}
                      checked={internalSelected.includes(department)}
                      onCheckedChange={() => handleToggleDepartment(department)}
                    />
                    <label htmlFor={`department-${department}`} className="text-sm cursor-pointer flex-1">
                      {department}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-2 text-center">No departments found</div>
              )}
            </div>
          </ScrollArea>

          {internalSelected.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-2">{internalSelected.length} selected:</div>
                <div className="flex flex-wrap gap-1 max-h-[100px] overflow-auto">
                  {internalSelected.map((dept) => (
                    <Badge key={dept} variant="secondary" className="text-xs">
                      {dept}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveDepartment(dept)
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleApply} className="w-full">
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
