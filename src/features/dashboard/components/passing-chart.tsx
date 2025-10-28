'use client';

import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

import { cn } from '@/lib/utils';

export const description = 'Student Passing Rate (Interactive Line Chart)';

const chartData = [
  { date: '2024-01', passed: 82, failed: 18 },
  { date: '2024-02', passed: 86, failed: 14 },
  { date: '2024-03', passed: 80, failed: 20 },
  { date: '2024-04', passed: 90, failed: 10 },
  { date: '2024-05', passed: 84, failed: 16 },
  { date: '2024-06', passed: 88, failed: 12 },
];

const chartConfig = {
  passed: {
    label: 'Passed',
    color: 'var(--chart-1)',
  },
  failed: {
    label: 'Failed',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function PassingRateChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>('passed');

  const total = React.useMemo(
    () => ({
      passed: chartData.reduce((acc, curr) => acc + curr.passed, 0),
      failed: chartData.reduce((acc, curr) => acc + curr.failed, 0),
    }),
    []
  );

  return (
    <Card className="bg-secondary-background py-0 text-foreground">
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 gap-0 border-b-2 border-b-border sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 sm:py-0 py-4 px-6">
          <CardTitle>Student Passing Rate</CardTitle>
          <CardDescription>
            Percentage of students passing vs. failing
          </CardDescription>
        </div>

        <div className="flex">
          {['passed', 'failed'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                onClick={() => setActiveChart(chart)}
                className="data-[active=true]:bg-[var(--chart-1)] even:data-[active=true]:bg-[var(--chart-2)]
                data-[active=true]:text-main-foreground text-foreground 
                relative z-10 flex flex-1 flex-col justify-center gap-1 px-6 py-4 
                text-left border-t-2 sm:border-l-2 border-border sm:px-8 sm:py-6"
              >
                <span className="text-xs">{chartConfig[chart].label}</span>
                <span className="text-lg leading-none font-heading sm:text-3xl">
                  {total[chart].toLocaleString()}%
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-2 p-4 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className={cn(
            'aspect-auto h-[250px] w-full',
            activeChart === 'passed' &&
              '[&_.recharts-layer_path]:stroke-[var(--color-passed)]',
            activeChart === 'failed' &&
              '[&_.recharts-layer_path]:stroke-[var(--color-failed)]'
          )}
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="students"
                  labelFormatter={(value) => `Month: ${value}`}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              strokeWidth={2}
              dot={false}
              activeDot={{ fill: 'var(--chart-active-dot)' }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
