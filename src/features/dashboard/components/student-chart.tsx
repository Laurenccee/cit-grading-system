import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartConfig,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Ellipsis } from 'lucide-react';
import React from 'react';
import { Pie, Label, PieChart } from 'recharts';

const chartData = [
  { major: 'ist', students: 27, fill: 'var(--color-ist)' },
  { major: 'smbpo', students: 27, fill: 'var(--color-smbpo)' },
  { major: 'hn', students: 24, fill: 'var(--color-hn)' },
  { major: 'bcwt', students: 19, fill: 'var(--color-bcwt)' },
  { major: 'aft', students: 11, fill: 'var(--color-aft)' },
  { major: 'clt', students: 30, fill: 'var(--color-clt)' },
];

const chartConfig = {
  students: {
    label: 'Students',
  },
  ist: {
    label: 'IST 2A',
    color: 'var(--chart-1)',
  },
  smbpo: {
    label: 'SMBPO 2A',
    color: 'var(--chart-2)',
  },
  hn: {
    label: 'HN 2A',
    color: 'var(--chart-3)',
  },
  bcwt: {
    label: 'BCWT 1A',
    color: 'var(--chart-4)',
  },
  aft: {
    label: 'AFT 1A',
    color: 'var(--chart-5)',
  },
  clt: {
    label: 'CLT 1A',
    color: 'var(--chart-6)',
  },
} satisfies ChartConfig;

export default function StudentChart() {
  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.students, 0);
  }, []);
  return (
    <>
      <Card className="flex flex-col basis-xl bg-secondary-background text-foreground">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Students</CardTitle>
          <Button size={'icon'} className="size-7">
            <Ellipsis />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="students"
                nameKey="major"
                innerRadius={60}
                strokeWidth={2}
              >
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
                            {totalStudents.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-foreground"
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
      </Card>
    </>
  );
}
