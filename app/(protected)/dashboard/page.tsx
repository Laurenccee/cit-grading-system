'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import { Ellipsis, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Pie, Label, PieChart } from 'recharts';
import StudentChart from '@/features/dashboard/components/student-chart';
import AttendanceChart from '@/features/dashboard/components/attendance-chart';
import PassingChart from '@/features/dashboard/components/passing-chart';
import PassingRateChart from '@/features/dashboard/components/passing-chart';

export default function Dashboard() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <>
      <div className="flex gap-5">
        <div className="flex flex-col w-full gap-5">
          <div className="flex w-full gap-2.5">
            <Card>
              <CardHeader>
                <CardTitle>Students Total</CardTitle>
                <CardDescription>All Enrolled Students</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your recent activity will appear here.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Class Today</CardTitle>
                <CardDescription>Scheduled Classes</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your recent activity will appear here.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Present Today</CardTitle>
                <CardDescription>Student Present</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your recent activity will appear here.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Absent Today</CardTitle>
                <CardDescription>Student Absent</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your recent activity will appear here.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex  w-full gap-2.5">
            <StudentChart />
            <AttendanceChart />
          </div>
          <div className="flex  w-full gap-2.5">
            <PassingRateChart />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className=""
        />
      </div>
    </>
  );
}
