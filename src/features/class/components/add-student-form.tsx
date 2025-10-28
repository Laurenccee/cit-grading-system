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
import { Input } from '@/components/ui/input';
import { ClipboardPenLine, Plus, UserIcon } from 'lucide-react';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from '@/components/ui/input-group';
import { addStudent, updateStudent } from '../actions/student';
import Combobox from './combobox';

export default function InsertStudentForm() {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      const result = await addStudent(formData);
      console.log('Add student result:', result);
      if (result.status === 'success') {
        console.log('Student added!');
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
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" className="flex gap-2.5">
            <Plus />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2.5">
              <div className="flex gap-2.5">
                <InputGroup>
                  <InputGroupInput
                    name="student_id"
                    placeholder="Student ID"
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
                    name="middle_name"
                    placeholder="Middle Name"
                  />
                  <InputGroupAddon>
                    <UserIcon />
                  </InputGroupAddon>
                </InputGroup>
                <InputGroup>
                  <InputGroupInput name="last_name" placeholder="Last Name" />
                  <InputGroupAddon>
                    <UserIcon />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <Combobox
                type="course"
                name="course"
                selectedCourse={selectedCourse}
                onChange={(value) => setSelectedCourse(value)}
              />
              <Combobox
                type="major"
                name="major"
                selectedCourse={selectedCourse}
              />
              <div className="flex gap-2.5">
                <Combobox
                  type="year_level"
                  name="year_level"
                  selectedCourse={selectedCourse}
                />
                <Combobox
                  type="section"
                  name="section"
                  selectedCourse={selectedCourse}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
