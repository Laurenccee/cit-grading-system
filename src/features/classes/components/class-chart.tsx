'use client';

import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart, Cell } from 'recharts';
import * as React from 'react';

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

const chartConfig = {
  students: {
    label: 'Students',
  },
} satisfies ChartConfig;

interface ClassPieDonutProps {
  students: { subject_name: string; subject_code: string }[]; // 🟢 Now grouped by class instead of section
  className?: string;
}

export default function ClassPieDonut({
  students,
  className,
}: ClassPieDonutProps) {
  // ✅ Count students per class (e.g., "Intro to Programming", "Database Systems")
  const classCounts = Object.entries(
    students.reduce((acc: Record<string, number>, s) => {
      const key = `${s.subject_code || 'N/A'} - ${
        s.subject_name || 'Unknown Class'
      }`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([className, count]) => ({ className, count }));

  // 🎨 Dynamic colors
  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
  ];

  const chartData = classCounts.map((item, index) => ({
    name: item.className,
    value: item.count,
    fill: colors[index % colors.length],
  }));

  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card
      className={`flex flex-col bg-secondary-background text-foreground shadow-md ${
        className || ''
      }`}
    >
      <CardHeader className="items-center pb-0">
        <CardTitle>Students per Class</CardTitle>
        <CardDescription>Distribution by class name</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="name"
                  labelFormatter={(label) => `Class: ${label}`}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}

              {/* Center label */}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalStudents}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-muted-foreground text-sm"
                        >
                          Students
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing total students across classes
        </div>
      </CardFooter>
    </Card>
  );
}
