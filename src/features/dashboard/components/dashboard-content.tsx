'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import StudentChart from '@/features/dashboard/components/student-chart';
import AttendanceChart from '@/features/dashboard/components/attendance-chart';
import { Button } from '@/components/ui/button';
import {
  Ellipsis,
  Users,
  Clock,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';

interface DashboardContentProps {
  classes: any[];
}

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function DashboardContent({ classes }: DashboardContentProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Filter classes by selected day
  const selectedDayName = date ? DAYS[date.getDay()] : '';
  const todayClasses = React.useMemo(() => {
    if (!selectedDayName || !classes) return [];

    const classesWithSchedules = classes
      .filter((cls: any) =>
        cls.schedules?.some(
          (schedule: any) => schedule.day_of_week === selectedDayName
        )
      )
      .map((cls: any) => {
        // Get schedules for the selected day
        const daySchedules = cls.schedules.filter(
          (s: any) => s.day_of_week === selectedDayName
        );
        return {
          ...cls,
          daySchedules,
        };
      });

    // Remove duplicates: if same subject_code and same time, keep only one
    const uniqueClasses = new Map();

    classesWithSchedules.forEach((cls: any) => {
      cls.daySchedules.forEach((schedule: any) => {
        const key = `${cls.subject_code}-${schedule.start_time}-${schedule.end_time}`;

        if (!uniqueClasses.has(key)) {
          uniqueClasses.set(key, {
            ...cls,
            daySchedules: [schedule],
          });
        }
      });
    });

    // Convert map to array and sort by time
    return Array.from(uniqueClasses.values()).sort((a: any, b: any) => {
      const timeA = a.daySchedules[0]?.start_time || '';
      const timeB = b.daySchedules[0]?.start_time || '';
      return timeA.localeCompare(timeB);
    });
  }, [classes, date, selectedDayName]);

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-foreground/60 mt-0.5">
          Overview of your classes and schedules
        </p>
      </div>

      <div className="flex gap-5">
        <div className="flex flex-col w-full gap-5">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-1 sm:grid-rows-1 2xl:grid-cols-4 2xl:grid-rows-1 xl:grid-cols-2 xl:grid-rows-2 w-full gap-2.5">
            <Card className="group flex flex-row gap-2.5 p-4 border-2 border-border bg-background shadow-shadow hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12 bg-primary border-2 border-border shrink-0">
                  <Users className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wide leading-none">
                    Students
                  </p>
                  <p className="text-xl font-bold text-foreground mt-1">360</p>
                </div>
              </div>
            </Card>
            <Card className="group flex flex-row gap-2.5 p-4 border-2 border-border bg-background shadow-shadow hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12 bg-primary border-2 border-border shrink-0">
                  <GraduationCap className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wide leading-none">
                    Classes
                  </p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {classes.length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="group flex flex-row gap-2.5 p-4 border-2 border-border bg-background shadow-shadow hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12 bg-primary border-2 border-border shrink-0">
                  <TrendingUp className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wide leading-none">
                    Attendance
                  </p>
                  <p className="text-xl font-bold text-foreground mt-1">92%</p>
                </div>
              </div>
            </Card>
            <Card className="group flex flex-row gap-2.5 p-4 border-2 border-border bg-background shadow-shadow hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
              {/* Icon Section */}
              <div className="flex gap-2.5">
                <div className="flex justify-center items-center size-12 bg-primary border-2 border-border shrink-0">
                  <Award className="size-6" />
                </div>

                {/* Text Section */}
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-bold text-foreground/60 uppercase tracking-wide leading-none">
                    Avg. Grade
                  </p>
                  <p className="text-xl font-bold text-foreground mt-1">85.5</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="flex 2xl:flex-row xl:flex-col w-full gap-2.5">
            <StudentChart />
            <AttendanceChart />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-2.5">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="[--cell-size:--spacing(11)] md:[--cell-size:--spacing(12)]"
          />

          <Card className="border-2 border-border bg-background shadow-shadow hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200">
            <div className="p-4">
              <h3 className="text-base font-bold text-foreground">Schedule</h3>
              {selectedDayName && (
                <p className="text-xs text-foreground/60 mt-1">
                  {selectedDayName},{' '}
                  {date?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>

            <Separator />

            <CardContent className="p-3">
              {todayClasses.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {todayClasses.map((cls: any, index: number) => (
                    <div key={cls.id}>
                      <div className="group p-2.5 hover:bg-muted/20 transition-colors border-l-2 border-primary">
                        <h4 className="font-bold text-foreground text-sm">
                          {cls.subject_code}
                        </h4>
                        <p className="text-xs text-foreground/70 mt-0.5 line-clamp-1">
                          {cls.subject_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="size-3 text-foreground/50" />
                          <span className="text-xs text-foreground/60">
                            {cls.daySchedules.map((s: any, i: number) => (
                              <span key={i}>
                                {s.start_time} - {s.end_time}
                                {i < cls.daySchedules.length - 1 && ', '}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                      {index < todayClasses.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="size-8 text-foreground/30 mb-3" />
                  <p className="text-sm font-bold text-foreground/60">
                    No classes scheduled
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">
                    for {selectedDayName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
