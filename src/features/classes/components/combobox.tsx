'use client';

import * as React from 'react';
import { CheckIcon, ChevronDown, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { fetchData } from '../data/dropdown';

interface ComboboxProps {
  type: 'course' | 'major' | 'year_level' | 'section';
  name: string;
  selectedCourse?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}

export default function Combobox({
  type,
  name,
  selectedCourse,
  onChange,
  defaultValue = '',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);
  const [fetchcomboData, setFetchcomboData] = React.useState<any | null>(null);

  React.useEffect(() => {
    async function loadData() {
      const data = await fetchData();
      setFetchcomboData(data);
    }
    loadData();
  }, []);

  if (!fetchcomboData) {
    return (
      <InputGroup>
        <InputGroupAddon>
          <UserIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder={`Loading ${type}...`} readOnly />
        <input type="hidden" name={name} value={value} />
        <InputGroupAddon align="inline-end">
          <Button
            variant="noShadow"
            size="icon"
            className="p-0 size-7 hover:opacity-70"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </InputGroupAddon>
      </InputGroup>
    );
  }

  // --- derive data dynamically ---
  let data: { id: string; code: string; name: string }[] = [];

  if (type === 'major' && selectedCourse) {
    // ✅ Compare course_id directly to selectedCourse (UUID)
    data = fetchcomboData.major.filter(
      (m: any) => m.course_id === selectedCourse
    );
  } else {
    data = fetchcomboData[type] || [];
  }

  const selectedLabel = data.find((f) => f.id === value)?.name ?? '';
  const disabled = type === 'major' && !selectedCourse;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroup>
        <InputGroupAddon>
          <UserIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={`Select ${type.replace('_', ' ')}...`}
          readOnly
          value={selectedLabel}
          disabled={disabled}
          onClick={() => !disabled && setOpen(true)}
        />
        <input type="hidden" name={name} value={value} />
        <InputGroupAddon align="inline-end">
          <PopoverTrigger asChild>
            <Button
              variant="noShadow"
              size="icon"
              disabled={disabled}
              className="p-0 size-7 hover:opacity-70"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </InputGroupAddon>
      </InputGroup>

      <PopoverContent
        align="start"
        side="bottom"
        className="w-[--radix-popover-trigger-width] border-0 p-0 shadow-lg"
      >
        <Command>
          <CommandInput placeholder={`Search ${type}...`} />
          <CommandList className="p-1">
            <CommandEmpty>No {type} found.</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    setValue(item.id);
                    onChange?.(item.id);
                    setOpen(false);
                  }}
                >
                  {item.name}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === item.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
