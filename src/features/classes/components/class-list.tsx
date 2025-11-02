'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Edit2, Trash2, Clock } from 'lucide-react';
import UpdateClassForm from '@/features/classes/components/classes-form/update-classes-form';
import { deleteClass } from '@/features/classes/actions/classes';
import type { FormattedClass } from '@/features/classes/types/classes';

interface ClassListProps {
  initialClasses: FormattedClass[];
  dropdownData?: any;
}

export default function ClassList({
  initialClasses,
  dropdownData,
}: ClassListProps) {
  const [classes, setClasses] = useState(initialClasses);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    setLoading(true);
    setError('');

    try {
      const result = await deleteClass(id);
      if (result.status === 'success') {
        setClasses((current) => current.filter((cls) => cls.id !== id));
      } else {
        setError(result.status || 'Failed to delete class.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {classes.map((cls) => (
        <Card
          key={cls.id}
          className="border-2 border-border bg-background shadow-shadow hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200"
        >
          {/* 🧩 Header */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-main">
                {cls.subject_code} - {cls.subject_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {`${cls.course} • ${cls.major} • ${cls.year_level}${cls.section}`}
              </p>
            </div>

            {/* 👥 Student Count */}
            <div className="flex gap-2.5 items-center text-right">
              <Users />
              <span className="text-xl font-bold text-foreground">
                {cls.studentCount ?? 0}
              </span>
            </div>
          </CardHeader>

          {/* 🕒 Schedule + Actions */}
          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Schedule list */}
            <div className="flex flex-col text-sm text-muted-foreground gap-1">
              {cls.schedules && cls.schedules.length > 0 ? (
                cls.schedules.map((sched, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>
                      {sched.day_of_week}: {sched.start_time} - {sched.end_time}
                    </span>
                  </div>
                ))
              ) : (
                <span className="italic text-gray-500">No schedule set</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-2 sm:mt-0">
              <UpdateClassForm classData={cls} dropdownData={dropdownData}>
                <Button
                  variant="default"
                  size="icon"
                  className="size-8 bg-blue-500 hover:bg-blue-600"
                >
                  <Edit2 className="size-4" />
                </Button>
              </UpdateClassForm>

              <Button
                onClick={() => handleDelete(cls.id)}
                disabled={loading}
                variant="default"
                size="icon"
                className="size-8 bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
