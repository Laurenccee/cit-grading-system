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
  students: {
    subject_name: string;
    subject_code: string;
    enrollmentCount: number;
  }[];
  className?: string;
}

export default function ClassPieDonut({
  students,
  className,
}: ClassPieDonutProps) {
  // ✅ Map each class with its actual student enrollment count
  const classData = students.map((s) => ({
    className: `${s.subject_code || 'N/A'} - ${s.subject_name || 'Unknown'}`,
    count: s.enrollmentCount || 0,
  }));

  // 🎨 Dynamic colors
  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
  ];

  const chartData = classData.map((item, index) => ({
    name: item.className,
    value: item.count,
    fill: colors[index % colors.length],
  }));

  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card
      className={`flex flex-col bg-background text-foreground shadow-shadow border-2 border-border hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200 ${
        className || ''
      }`}
    >
      <div className="border-b-2 border-border p-4">
        <CardTitle className="text-base font-bold text-foreground">
          Student Distribution
        </CardTitle>
        <p className="text-xs text-foreground/60 mt-0.5 font-medium">
          Enrollment across classes
        </p>
      </div>

      <CardContent className="flex-1 pb-1">
        {totalStudents > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[220px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    nameKey="name"
                    labelFormatter={(label) => {
                      // Truncate long class names in tooltip
                      return label.length > 30
                        ? label.substring(0, 27) + '...'
                        : label;
                    }}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={90}
                strokeWidth={2}
                stroke="var(--background)"
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
                            className="fill-muted-foreground text-xs"
                          >
                            Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-56 text-sm font-normal text-foreground/60">
            No student enrollments yet
          </div>
        )}
      </CardContent>

      {/* Legend */}
      {totalStudents > 0 && (
        <div className="border-t-2 border-border p-3">
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
            {chartData.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm group hover:bg-muted/30 px-1 py-0.5 -mx-1 transition-colors"
              >
                <div
                  className="w-3 h-3 shrink-0 border-2 border-border transition-transform group-hover:scale-110"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-foreground/70 line-clamp-1 flex-1 truncate font-normal">
                  {item.name}
                </span>
                <span className="font-bold text-foreground shrink-0">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
