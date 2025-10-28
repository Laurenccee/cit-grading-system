'use client';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { SearchIcon } from 'lucide-react';
import React from 'react';

export default function Search() {
  return (
    <InputGroup>
      <InputGroupInput name="text" placeholder="Search" />
      <InputGroupAddon align="inline-end">
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  );
}
