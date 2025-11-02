'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Users, Edit2, Trash2, Clock, Search, X } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Filter classes based on search term
  const filteredClasses = useMemo(
    () =>
      classes.filter(
        (cls) =>
          cls.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.course.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [classes, searchTerm]
  );

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 size-4 text-foreground/40 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10 h-11 border-2 border-border bg-background text-foreground text-sm font-semibold"
        />
        {searchTerm && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-3 text-foreground/40 hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Results info */}
      {filteredClasses.length > 0 && (
        <p className="text-sm font-bold text-foreground/60">
          {filteredClasses.length} class
          {filteredClasses.length !== 1 ? 'es' : ''} found • Page {currentPage}{' '}
          of {totalPages}
        </p>
      )}

      {/* Grid Layout */}
      <div className="flex-1">
        {paginatedClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {paginatedClasses.map((cls) => (
              <div
                key={cls.id}
                className="group border-2 border-border bg-background shadow-shadow hover:translate-y-boxShadowY hover:shadow-none transition-all duration-200 flex flex-col"
              >
                {/* Card Header */}
                <div className="p-4 transition-colors group-hover:bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-foreground text-lg mb-1.5 truncate leading-none">
                        {cls.subject_code}
                      </h3>
                      <p className="text-sm text-foreground/70 truncate leading-snug font-normal">
                        {cls.subject_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-primary/10 border-2 border-primary px-3 py-1.5 shrink-0 transition-all group-hover:bg-primary/20">
                      <Users className="size-4 text-foreground/80" />
                      <span className="text-base font-bold text-foreground">
                        {cls.enrollmentCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Card Body */}
                <div className="flex-1 p-4 space-y-3">
                  {/* Info Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/10 border-2 border-primary text-foreground text-sm px-3 py-1 font-bold">
                      {cls.course}
                    </Badge>
                    <Badge className="bg-chart-2/10 border-2 border-chart-2 text-foreground text-sm px-3 py-1 font-bold">
                      {cls.major}
                    </Badge>
                    <Badge className="bg-chart-3/10 border-2 border-chart-3 text-foreground text-sm px-3 py-1 font-bold">
                      {cls.year_level}
                      {cls.section}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Schedule */}
                  {cls.schedules && cls.schedules.length > 0 && (
                    <div className="pt-3 space-y-2">
                      <span className="text-xs font-bold text-foreground/60 uppercase tracking-widest">
                        Schedule
                      </span>
                      {cls.schedules.map((sched, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Clock className="size-4 text-foreground/50 shrink-0" />
                          <span className="font-semibold text-foreground">
                            {sched.day_of_week}
                          </span>
                          <span className="text-foreground/40">•</span>
                          <span className="font-normal text-foreground/80">
                            {sched.start_time} – {sched.end_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Card Footer */}
                <div className="p-3 flex gap-2">
                  <UpdateClassForm classData={cls} dropdownData={dropdownData}>
                    <Button
                      size="sm"
                      variant="neutral"
                      className="h-9 px-4 text-sm gap-2 font-bold flex-1"
                    >
                      <Edit2 className="size-4" />
                      Edit
                    </Button>
                  </UpdateClassForm>

                  <Button
                    onClick={() => handleDelete(cls.id)}
                    disabled={loading}
                    size="sm"
                    variant="neutral"
                    className="h-9 px-4 text-sm gap-2 font-bold flex-1"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-border bg-background p-8 text-center shadow-shadow">
            <p className="text-sm font-bold text-foreground/60">
              No classes match your search.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredClasses.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between border-t-2 border-border pt-4">
          <Pagination className="flex-1 mb-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <span className="text-sm font-black text-foreground mx-2">
            Page {currentPage} of {totalPages}
          </span>

          <Pagination className="flex-1 mb-0 justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border-2 border-red-500 text-red-600 text-sm font-bold">
          {error}
        </div>
      )}
    </div>
  );
}
