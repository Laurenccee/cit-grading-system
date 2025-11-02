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
import { createClient } from '@/utils/supabase/client';
import { addClass } from '@/features/classes/actions/classes';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface ClassSchedule {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export default function InsertClassForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [schedules, setSchedules] = useState<ClassSchedule[]>([
    { day_of_week: '', start_time: '', end_time: '' },
  ]);

  // Dropdown data
  const [courses, setCourses] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  // Selected values
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // ✅ Fetch dropdown data
  useEffect(() => {
    if (open) {
      const supabase = createClient();
      const loadDropdowns = async () => {
        try {
          const [coursesRes, majorsRes, yearsRes, sectionsRes] =
            await Promise.all([
              supabase.from('courses').select('id, code, name'),
              supabase.from('majors').select('id, code, name, course_id'),
              supabase.from('year_levels').select('id, code, name'),
              supabase.from('sections').select('id, code, name'),
            ]);

          if (coursesRes.data) setCourses(coursesRes.data);
          if (majorsRes.data) setMajors(majorsRes.data);
          if (yearsRes.data) setYears(yearsRes.data);
          if (sectionsRes.data) {
            console.log('✅ Sections loaded:', sectionsRes.data);
            setSections(sectionsRes.data);
          }

          // Log errors if any
          if (coursesRes.error)
            console.error('Courses error:', coursesRes.error);
          if (majorsRes.error) console.error('Majors error:', majorsRes.error);
          if (yearsRes.error) console.error('Years error:', yearsRes.error);
          if (sectionsRes.error)
            console.error('Sections error:', sectionsRes.error);
        } catch (err) {
          console.error('Error loading dropdowns:', err);
        }
      };
      loadDropdowns();
    }
  }, [open]);

  const handleAddSchedule = () =>
    setSchedules((prev) => [
      ...prev,
      { day_of_week: '', start_time: '', end_time: '' },
    ]);

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
    formData.append('schedules', JSON.stringify(schedules));
    formData.append('course_id', selectedCourse);
    formData.append('major_id', selectedMajor);
    formData.append('year_level_id', selectedYear);
    formData.append('section_id', selectedSection);

    try {
      const result = await addClass(formData);
      if (result.status === 'success') setOpen(false);
      else setError(result.status);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2.5">
          Add Class
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Create a class and assign one or more schedules.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {/* Subject Code and Name */}
            <div className="flex gap-2.5">
              <InputGroup>
                <InputGroupInput
                  name="subject_code"
                  placeholder="Subject Code (e.g. IT101)"
                  required
                />
                <InputGroupAddon>
                  <BookOpen />
                </InputGroupAddon>
              </InputGroup>

              <InputGroup>
                <InputGroupInput
                  name="subject_name"
                  placeholder="Subject Name (e.g. Intro to Programming)"
                  required
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
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} — {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Major Dropdown */}
            <Select
              value={selectedMajor}
              onValueChange={setSelectedMajor}
              disabled={!majors.some((m) => m.course_id === selectedCourse)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    majors.some((m) => m.course_id === selectedCourse)
                      ? 'Select Major'
                      : 'No Majors Available'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {majors
                  .filter((m) => m.course_id === selectedCourse)
                  .map((major) => (
                    <SelectItem key={major.id} value={major.id}>
                      {major.code} — {major.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Year Level and Section */}
            <div className="flex gap-2.5">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year Level" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={sections.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      sections.length === 0
                        ? 'Loading Sections...'
                        : 'Select Section'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.code} — {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Section */}
            <div className="border-t pt-3 mt-2">
              <span className="font-medium text-lg mb-2 block">
                Class Schedule
              </span>

              {schedules.map((schedule, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <Select
                    value={schedule.day_of_week}
                    onValueChange={(value: string) =>
                      handleScheduleChange(index, 'day_of_week', value)
                    }
                  >
                    <SelectTrigger className="w-40">
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
                className="mt-2 flex gap-2 w-full items-center"
                onClick={handleAddSchedule}
              >
                <Plus size={16} /> Add Another Schedule
              </Button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
