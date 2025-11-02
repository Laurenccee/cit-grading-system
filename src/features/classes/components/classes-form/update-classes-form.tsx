'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@/components/ui/input-group';
import { Plus, Clock, BookOpen } from 'lucide-react';
import { createClient } from '@/utils/supabase/client'; // ✅ use client instance
import { addClass, updateClass } from '@/features/classes/actions/classes';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { FormattedClass } from '../../types/classes';
import { Separator } from '@/components/ui/separator';

interface ClassSchedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface ClassFormProps {
  classData: FormattedClass;
  children?: React.ReactNode;
  dropdownData: {
    course: any[];
    major: any[];
    year_level: any[];
    section: any[];
  };
}

export default function UpdateClassForm({
  classData,
  children,
  dropdownData,
}: ClassFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(
    classData.course_id || ''
  );
  const [selectedMajor, setSelectedMajor] = useState(classData.major_id || '');
  const [selectedYear, setSelectedYear] = useState(
    classData.year_level_id || ''
  );
  const [selectedSection, setSelectedSection] = useState(
    classData.section_id || ''
  );

  const [schedules, setSchedules] = useState<ClassSchedule[]>(
    classData.schedules?.length
      ? classData.schedules
      : [{ day_of_week: '', start_time: '', end_time: '' }]
  );

  const handleUpdateSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      { day_of_week: '', start_time: '', end_time: '' },
    ]);
  };

  const handleScheduleChange = (
    index: number,
    field: keyof ClassSchedule,
    value: string
  ) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    formData.append('id', classData.id);
    formData.append('schedules', JSON.stringify(schedules));

    try {
      const result = await updateClass(formData);
      if (result.status === 'success') setOpen(false);
      else setError(result.status);
    } catch {
      setError('Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Update Class</DialogTitle>
            <DialogDescription>
              Modify the class details and schedule.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {/* Subject Code / Name */}
            <div className="flex gap-2.5">
              <InputGroup>
                <InputGroupInput
                  name="subject_code"
                  placeholder="Subject Code"
                  required
                  defaultValue={classData.subject_code}
                />
                <InputGroupAddon>
                  <BookOpen />
                </InputGroupAddon>
              </InputGroup>

              <InputGroup>
                <InputGroupInput
                  name="subject_name"
                  placeholder="Subject Name"
                  required
                  defaultValue={classData.subject_name}
                />
                <InputGroupAddon>
                  <BookOpen />
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Course Dropdown */}
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {dropdownData.course.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedMajor}
              onValueChange={setSelectedMajor}
              disabled={!dropdownData.major.length}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !dropdownData.major.length
                      ? 'No majors available'
                      : 'Select Major'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {dropdownData.major
                  .filter((m) => m.course_id === selectedCourse)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2.5">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year Level" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.year_level.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {dropdownData.section
                    .filter((s) => s.year_level_id === selectedYear)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.code}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Section */}
            <div className="flex flex-col gap-2.5">
              <span className="font-bold text-lg block">Class Schedule</span>

              {schedules.map((schedule, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="basis-1">
                    <Select
                      value={schedule.day_of_week}
                      onValueChange={(value: string) =>
                        handleScheduleChange(index, 'day_of_week', value)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                          'Sunday',
                        ].map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <InputGroup>
                    <InputGroupInput
                      type="time"
                      value={schedule.start_time}
                      onChange={(e) =>
                        handleScheduleChange(
                          index,
                          'start_time',
                          e.target.value
                        )
                      }
                      required
                    />
                    <InputGroupAddon>
                      <Clock />
                    </InputGroupAddon>
                  </InputGroup>

                  <InputGroup>
                    <InputGroupInput
                      type="time"
                      value={schedule.end_time}
                      onChange={(e) =>
                        handleScheduleChange(index, 'end_time', e.target.value)
                      }
                      required
                    />
                    <InputGroupAddon>
                      <Clock />
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              ))}

              <Button
                type="button"
                variant="noShadow"
                className="w-full flex gap-2 items-center"
                onClick={handleUpdateSchedule}
              >
                <Plus size={16} /> Add Another Schedule
              </Button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
