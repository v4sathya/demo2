"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Link2, FileText, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CsvUploadProps {
  onDataLoaded: (data: any[]) => void
}

export function CsvUpload({ onDataLoaded }: CsvUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    setError(null)
  }

  const validateCSVData = (data: any[]): { valid: boolean; message: string } => {
    if (data.length === 0) {
      return { valid: false, message: "The CSV file is empty. Please upload a file with data." }
    }

    // Validate that the CSV has the expected columns
    const requiredColumns = [
      "Department",
      "Metric_Name",
      "Visible_in_Dashboard",
      "Used_in_Decision_Making",
      "Executive_Requested",
      "Last_Reviewed",
      "Metric_Last_Used_For_Decision",
      "Interpretation_Notes",
    ]

    const firstRow = data[0]
    const missingColumns = requiredColumns.filter((col) => !(col in firstRow))

    if (missingColumns.length > 0) {
      return {
        valid: false,
        message: `CSV is missing required columns: ${missingColumns.join(", ")}. Please check the file format.`,
      }
    }

    // Check for empty required fields in the data
    const rowsWithMissingData = data.filter((row, index) => {
      return (
        !row.Department ||
        !row.Metric_Name ||
        !row.Visible_in_Dashboard ||
        !row.Used_in_Decision_Making ||
        !row.Executive_Requested
      )
    })

    if (rowsWithMissingData.length > 0) {
      return {
        valid: false,
        message: `${rowsWithMissingData.length} rows have missing required data. Please check your CSV file.`,
      }
    }

    return { valid: true, message: "CSV data is valid" }
  }

  const parseCSV = (csvText: string): any[] => {
    try {
      // Split the CSV text into lines
      const lines = csvText.split("\n")

      if (lines.length <= 1) {
        throw new Error("CSV file appears to be empty or contains only headers")
      }

      // Extract the header line and parse it
      const headerLine = lines[0]
      const headers = headerLine.split(",").map((header) => header.trim().replace(/"/g, ""))

      // Parse each data line
      const data: any[] = []

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

        data.push(rowData)
      }

      return data
    } catch (error) {
      console.error("Error parsing CSV:", error)
      throw new Error("Failed to parse CSV file. Please check the format.")
    }
  }

  const handleUpload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let csvData: any[] = []

      if (activeTab === "upload" && file) {
        const text = await file.text()
        csvData = parseCSV(text)
      } else if (activeTab === "url" && url) {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV from URL: ${response.status} ${response.statusText}`)
        }
        const text = await response.text()
        csvData = parseCSV(text)
      } else {
        throw new Error("Please provide a CSV file or URL")
      }

      // Validate the CSV data
      const validation = validateCSVData(csvData)
      if (!validation.valid) {
        throw new Error(validation.message)
      }

      onDataLoaded(csvData)
      setOpen(false)
    } catch (err) {
      console.error("Error processing CSV:", err)
      setError(err instanceof Error ? err.message : "Failed to process CSV file")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseDefaultData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/week%202%20-%20Problem_4_-_Vanity_Metrics_Dashboard__Revised_-BBx5t4ci4Gr3QJRPEKCkbZWLzeJBcm.csv",
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch default CSV data: ${response.status} ${response.statusText}`)
      }

      const text = await response.text()
      const csvData = parseCSV(text)

      // Validate the CSV data
      const validation = validateCSVData(csvData)
      if (!validation.valid) {
        throw new Error(validation.message)
      }

      onDataLoaded(csvData)
      setOpen(false)
    } catch (err) {
      console.error("Error loading default data:", err)
      setError(err instanceof Error ? err.message : "Failed to load default data")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setUrl("")
    setError(null)
    // Reset the file input by creating a new ref
    const fileInput = document.getElementById("csv-file") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Load CSV Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Load KPI Data</DialogTitle>
          <DialogDescription>Upload a CSV file or provide a URL to load KPI data into the dashboard.</DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="upload"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            setError(null)
          }}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} disabled={isLoading} />
              <p className="text-xs text-muted-foreground">File must be in CSV format with the required columns.</p>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="csv-url">CSV URL</Label>
              <Input
                id="csv-url"
                type="url"
                placeholder="https://example.com/data.csv"
                value={url}
                onChange={handleUrlChange}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Enter a URL to a publicly accessible CSV file.</p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/50 rounded-md p-3 text-xs">
          <h4 className="font-medium mb-1">Required CSV Format</h4>
          <p className="mb-2">Your CSV file must include these columns:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Department</li>
            <li>Metric_Name</li>
            <li>Visible_in_Dashboard</li>
            <li>Used_in_Decision_Making</li>
            <li>Executive_Requested</li>
            <li>Last_Reviewed</li>
            <li>Metric_Last_Used_For_Decision</li>
            <li>Interpretation_Notes</li>
          </ul>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetForm} disabled={isLoading} className="w-full sm:w-auto">
            Reset
          </Button>
          <Button variant="outline" onClick={handleUseDefaultData} disabled={isLoading} className="w-full sm:w-auto">
            <Link2 className="h-4 w-4 mr-2" />
            Use Example Data
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isLoading || (activeTab === "upload" && !file) || (activeTab === "url" && !url)}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Load Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
