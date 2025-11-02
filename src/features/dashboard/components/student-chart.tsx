'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Ellipsis } from 'lucide-react';
import React from 'react';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ✅ Example Data
const chartData = [
  { major: 'IST', students: 27 },
  { major: 'SMBPO', students: 27 },
  { major: 'HN', students: 24 },
  { major: 'BCWT', students: 19 },
  { major: 'AFT', students: 11 },
  { major: 'CLT', students: 30 },
];

// ✅ Chart configuration (labels and color mapping)
const chartConfig: ChartConfig = {
  students: { label: 'Students' },
  IST: { color: 'var(--chart-1)' },
  SMBPO: { color: 'var(--chart-2)' },
  HN: { color: 'var(--chart-3)' },
  BCWT: { color: 'var(--chart-4)' },
  AFT: { color: 'var(--chart-5)' },
  CLT: { color: 'var(--chart-6)' },
};

export default function StudentChart() {
  const totalStudents = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.students, 0),
    []
  );

  return (
    <Card className="flex flex-col bg-secondary-background text-foreground">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Students by Major</CardTitle>
        <Button size="icon" className="size-7">
          <Ellipsis />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="major"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      chartConfig[entry.major as keyof typeof chartConfig]
                        ?.color || 'hsl(var(--chart-1))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <p className="text-sm text-muted-foreground mt-4">
          Total Students: <span className="font-semibold">{totalStudents}</span>
        </p>
      </CardContent>
    </Card>
  );
}
