"use client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EnergyChart({ data }: { data: any[] }) {
  if (data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy & Morale Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 4]} ticks={[1, 2, 3]} tickFormatter={(val) => val === 3 ? 'High' : val === 2 ? 'Med' : 'Low'} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energy" stroke="#8884d8" name="Energy" />
              <Line type="monotone" dataKey="morale" stroke="#82ca9d" name="Morale" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
