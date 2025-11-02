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
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import InsertStudentForm from '../[major]/components/student-form/add-student-form';
import UpdateStudentForm from '../[major]/components/student-form/update-student-form';
import { createClient } from '@/utils/supabase/client';
import { deleteStudent } from '../[major]/actions/student';
import { FormattedStudent } from '../types/classes';
import Combobox from './combobox';

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

interface ClassTableProps {
  data: FormattedStudent[];
  classID: string;
}

export default function ClassTable({ data, classID }: ClassTableProps) {
  const supabase = createClient();
  const [students, setStudents] = useState<FormattedStudent[]>(data);
  const [selectedSection, setSelectedSection] = useState<string>(''); // 👈 selected section
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🧮 Extract unique sections from the data
  const sections = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((s) => s.section).filter(Boolean))
    );
    return unique;
  }, [data]);

  // 🧹 Filter students by selected section (if any)
  const filteredStudents = useMemo(() => {
    if (!selectedSection || selectedSection === 'All') return students;
    return students.filter((s) => s.section === selectedSection);
  }, [students, selectedSection]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'student_id',
      header: 'Student ID',
      cell: ({ row }) => <div>{row.getValue('student_id')}</div>,
    },
    {
      accessorKey: 'last_name',
      header: 'Last Name',
      cell: ({ row }) => <div>{row.getValue('last_name')}</div>,
    },
    {
      accessorKey: 'first_name',
      header: 'First Name',
      cell: ({ row }) => <div>{row.getValue('first_name')}</div>,
    },
    {
      accessorKey: 'middle_name',
      header: 'Middle Name',
      cell: ({ row }) => <div>{row.getValue('middle_name')}</div>,
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

  const table = useReactTable({
    data: filteredStudents,
    columns: columns as ColumnDef<FormattedStudent, any>[],
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

  // 🗑 Delete handler
  const handleDelete = async (student_id: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await deleteStudent(student_id, classID);
      console.log('Delete student result:', result);
      if (result.status === 'success') {
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

  // 🔁 Real-time listener
  useEffect(() => {
    const channel = supabase
      .channel('students-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          console.log('Realtime!', payload);
          setStudents((current) => {
            const { eventType, new: newStudent, old: oldStudent } = payload;
            if (eventType === 'INSERT')
              return [...current, newStudent as FormattedStudent];
            if (eventType === 'UPDATE')
              return current.map((s) =>
                s.student_id === newStudent.student_id
                  ? (newStudent as FormattedStudent)
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

        {/* 👇 Only show Combobox if more than 1 section */}
        {sections.length > 1 && (
          <Combobox
            type="section"
            name="section"
            selectedCourse={selectedSection}
            onChange={(val) => setSelectedSection(val)}
          />
        )}

        <div className="flex gap-2.5">
          <InsertStudentForm classID={classID} />
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
                .map((column) => (
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
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        <Table>
          <TableHeader className="font-heading">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-secondary-background text-foreground"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="bg-secondary-background text-foreground data-[state=selected]:bg-main data-[state=selected]:text-main-foreground"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2">
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
    </div>
  );
}
