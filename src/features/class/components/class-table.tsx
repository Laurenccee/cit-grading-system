'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  ClipboardPenLine,
  Edit2,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StudentForm from './add-student-form';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { deleteStudent } from '../actions/student';
import UpdateStudentForm from './update-student-form';

export type Student = {
  student_id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  year_level: string;
  course: string;
  major: string;
  section: string;
};

export default function ClassTable({ data }: { data: Student[] }) {
  const columns: ColumnDef<Student>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'student_id',
      header: 'Student ID',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('student_id')}</div>
      ),
    },
    {
      accessorKey: 'last_name',
      header: ({ column }) => {
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Last Name
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('last_name')}</div>
      ),
    },
    {
      accessorKey: 'first_name',
      header: 'First Name',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('first_name')}</div>
      ),
    },
    {
      accessorKey: 'middle_name',
      header: 'Middle Name',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('middle_name')}</div>
      ),
    },
    {
      accessorKey: 'course',
      header: 'Course',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('course')}</div>
      ),
    },
    {
      accessorKey: 'major',
      header: 'Major',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('major')}</div>
      ),
    },
    {
      accessorKey: 'year_level',
      header: 'Year Level',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('year_level')}</div>
      ),
    },
    {
      accessorKey: 'section',
      header: 'Section',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('section')}</div>
      ),
    },

    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;

        return (
          <div className="flex justify-center gap-2.5">
            <Button
              onClick={() => handleDelete(student.student_id)}
              variant="default"
              size={'icon'}
              className="size-8 bg-red-400"
            >
              <Trash2 />
            </Button>
            <UpdateStudentForm student={student}>
              <Button variant="default" size={'icon'} className="size-8">
                <Edit2 />
              </Button>
            </UpdateStudentForm>
          </div>
        );
      },
    },
  ];
  const supabase = createClient();
  const [students, setStudents] = useState<Student[]>(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: students,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleDelete = async (student_id: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await deleteStudent(student_id);
      console.log('Delete student result:', result);
      if (result.status === 'success') {
        console.log('Student deleted!');
        setStudents((current) =>
          current.filter((s) => s.student_id !== student_id)
        );
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

  useEffect(() => {
    const channel = supabase
      .channel('students-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          console.log('Realtime!', payload);
          console.log(supabase.realtime.getChannels());

          setStudents((current) => {
            const { eventType, new: newStudent, old: oldStudent } = payload;
            if (eventType === 'INSERT')
              return [...current, newStudent as Student];
            if (eventType === 'UPDATE')
              return current.map((s) =>
                s.student_id === newStudent.student_id
                  ? (newStudent as Student)
                  : s
              );
            if (eventType === 'DELETE')
              return current.filter(
                (s) => s.student_id !== oldStudent.student_id
              );
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="w-full font-base text-main-foreground">
      <div className="flex justify-between items-center py-4">
        <Input
          placeholder="Filter last names..."
          value={
            (table.getColumn('last_name')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('last_name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2.5">
          <StudentForm />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="ml-auto">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <Table>
          <TableHeader className="font-heading">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-secondary-background text-foreground"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-foreground" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="bg-secondary-background text-foreground data-[state=selected]:bg-main data-[state=selected]:text-main-foreground"
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-4 py-2" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
