'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import React from 'react';
import StudentChart from '@/features/dashboard/components/student-chart';
import AttendanceChart from '@/features/dashboard/components/attendance-chart';
import { Button } from '@/components/ui/button';
import { Ellipsis, Users } from 'lucide-react';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item';

export default function Dashboard() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <>
      <div className="flex gap-5">
        <div className="flex flex-col w-full gap-5">
          <div className="grid sm:grid-cols-1 sm:grid-rows-1 2xl:grid-cols-4 2xl:grid-rows-1 xl:grid-cols-2 xl:grid-rows-2 w-full gap-2.5">
            <Card className="flex flex-row gap-3 p-4 border-2 justify-between border-border bg-background shadow-shadow">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12  bg-primary border-2 border-border">
                  <Users className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col">
                  <CardTitle className="text-sm">Students Total</CardTitle>
                  <p className="text-xl font-semibold text-muted-foreground">
                    360
                  </p>
                </div>
              </div>
              <div>
                <Button size="icon" className="size-7">
                  <Ellipsis />
                </Button>
              </div>
            </Card>
            <Card className="flex flex-row gap-3 p-4 border-2 justify-between border-border bg-background shadow-shadow">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12  bg-primary border-2 border-border">
                  <Users className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col">
                  <CardTitle className="text-sm">Students Total</CardTitle>
                  <p className="text-xl font-semibold text-muted-foreground">
                    360
                  </p>
                </div>
              </div>
              <div>
                <Button size="icon" className="size-7">
                  <Ellipsis />
                </Button>
              </div>
            </Card>
            <Card className="flex flex-row gap-3 p-4 border-2 justify-between border-border bg-background shadow-shadow">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12  bg-primary border-2 border-border">
                  <Users className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col">
                  <CardTitle className="text-sm">Students Total</CardTitle>
                  <p className="text-xl font-semibold text-muted-foreground">
                    360
                  </p>
                </div>
              </div>
              <div>
                <Button size="icon" className="size-7">
                  <Ellipsis />
                </Button>
              </div>
            </Card>
            <Card className="flex flex-row gap-3 p-4 border-2 justify-between border-border bg-background shadow-shadow">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12  bg-primary border-2 border-border">
                  <Users className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col">
                  <CardTitle className="text-sm">Students Total</CardTitle>
                  <p className="text-xl font-semibold text-muted-foreground">
                    360
                  </p>
                </div>
              </div>
              <div>
                <Button size="icon" className="size-7">
                  <Ellipsis />
                </Button>
              </div>
            </Card>
          </div>
          <div className="flex 2xl:flex-row xl:flex-col w-full gap-2.5">
            <StudentChart />
            <AttendanceChart />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="[--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          />
          <Card className="py-3">
            <CardHeader className="px-3">
              <CardTitle className="text-lg flex justify-between items-center">
                Schedule{' '}
                <Button size="icon" className="size-7">
                  <Ellipsis />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              <Item>
                <ItemContent>
                  <ItemTitle>Default Variant</ItemTitle>
                  <ItemDescription>
                    Standard styling with subtle background and borders.
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="default" size="sm">
                    Open
                  </Button>
                </ItemActions>
              </Item>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
