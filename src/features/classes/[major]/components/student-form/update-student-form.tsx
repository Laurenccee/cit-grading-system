'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
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
import { UserIcon } from 'lucide-react';
import { updateStudent } from '../../actions/student';
import { ClassStudent } from '@/features/classes/types/classes';

interface StudentFormProps {
  student: ClassStudent;
  children?: React.ReactNode;
}

export default function UpdateStudentForm({
  student,
  children,
}: StudentFormProps) {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState(student.course);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateStudent(formData);

      console.log('Update student result:', result);
      if (result.status === 'success') {
        console.log('Student updated!');
        setOpen(false);
      } else {
        setError(result.status);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Modify the student’s information below, then click Save Changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2.5">
            {/* --- Names --- */}
            <div className="flex gap-2.5">
              <InputGroup>
                <InputGroupInput
                  name="student_id"
                  placeholder="Student ID"
                  defaultValue={student.student_id}
                  required
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
              <InputGroup>
                <InputGroupInput
                  name="first_name"
                  placeholder="First Name"
                  defaultValue={student.first_name}
                  required
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="flex gap-2.5">
              <InputGroup>
                <InputGroupInput
                  defaultValue={student.middle_name}
                  name="middle_name"
                  placeholder="Middle Name"
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
              <InputGroup>
                <InputGroupInput
                  name="last_name"
                  placeholder="Last Name"
                  defaultValue={student.last_name}
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
