'use client';

import React from 'react';
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
import { Plus, UserIcon, ClipboardPenLine } from 'lucide-react';
import { addStudent } from '../../actions/student';

interface StudentFormProps {
  classID: string;
}

export default function InsertStudentForm({ classID }: StudentFormProps) {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    formData.append('class_id', classID);

    try {
      const result = await addStudent(formData);
      console.log('Add student result:', result);
      if (result.status === 'success') {
        console.log('✅ Student added successfully');
        setOpen(false);
      } else {
        setError(result.status);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="flex gap-2.5">
          <Plus />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>
              Fill out the student information below, then click “Add”.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="flex gap-2.5">
              <input type="hidden" name="class_id" value={classID} />
              <InputGroup>
                <InputGroupInput
                  name="student_id"
                  placeholder="Student ID (e.g. 2024-001)"
                  required
                />
                <InputGroupAddon>
                  <ClipboardPenLine />
                </InputGroupAddon>
              </InputGroup>

              <InputGroup>
                <InputGroupInput
                  name="first_name"
                  placeholder="First Name"
                  required
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="flex gap-2.5">
              <InputGroup>
                <InputGroupInput name="middle_name" placeholder="Middle Name" />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>

              <InputGroup>
                <InputGroupInput
                  name="last_name"
                  placeholder="Last Name"
                  required
                />
                <InputGroupAddon>
                  <UserIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
