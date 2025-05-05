"use client"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface MetricUsageChartProps {
  data: {
    department: string
    usedInDecisions: number
    notUsedInDecisions: number
    visibleInDashboard: number
    notVisibleInDashboard: number
  }[]
}

export function MetricUsageChart({ data }: MetricUsageChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="usedInDecisions" name="Used in Decisions" fill="#22c55e" />
          <Bar dataKey="notUsedInDecisions" name="Not Used in Decisions" fill="#ef4444" />
          <Bar dataKey="visibleInDashboard" name="Visible in Dashboard" fill="#3b82f6" />
          <Bar dataKey="notVisibleInDashboard" name="Not Visible in Dashboard" fill="#f97316" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
