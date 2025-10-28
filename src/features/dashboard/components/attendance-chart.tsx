'use client';

import { Ellipsis, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';

export const description = 'Attendance chart (Mon–Fri)';

const attendanceData = [
  { date: '2024-06-03', present: 420, absent: 80 }, // Mon
  { date: '2024-06-04', present: 380, absent: 110 }, // Tue
  { date: '2024-06-05', present: 450, absent: 50 }, // Wed
  { date: '2024-06-06', present: 470, absent: 60 }, // Thu
  { date: '2024-06-07', present: 430, absent: 90 }, // Fri
  { date: '2024-06-08', present: 400, absent: 100 }, // Sat (ignored)
  { date: '2024-06-09', present: 460, absent: 70 }, // Sun (ignored)
];

// ✅ Filter only Monday–Friday
const weekdayData = attendanceData.filter((d) => {
  const day = new Date(d.date).getDay();
  return day !== 0 && day !== 6;
});

const chartConfig = {
  present: {
    label: 'Present',
    color: 'var(--chart-1)',
  },
  absent: {
    label: 'Absent',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function AttendanceChart() {
  return (
    <Card className="bg-secondary-background text-foreground">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Attendance</CardTitle>
        <Button size={'icon'} className="size-7">
          <Ellipsis />
        </Button>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart accessibilityLayer data={weekdayData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  weekday: 'short',
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {/* Bars for Present and Absent */}
            <Bar dataKey="present" fill="var(--color-present)" radius={4} />
            <Bar dataKey="absent" fill="var(--color-absent)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
