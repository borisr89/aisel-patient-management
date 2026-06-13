'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaginationControlsProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function PaginationControls({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(total / limit),
  );

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
      >
        {total} patient{total === 1 ? '' : 's'}
        {' · '}
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <Select
          value={String(limit)}
          onValueChange={(value) => {
            onLimitChange(Number(value));
          }}
        >
          <SelectTrigger
            className="w-24"
            aria-label="Patients per page"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="10">
              10 rows
            </SelectItem>

            <SelectItem value="25">
              25 rows
            </SelectItem>

            <SelectItem value="50">
              50 rows
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() =>
            onPageChange(page - 1)
          }
        >
          <ChevronLeft
            className="size-4"
            aria-hidden="true"
          />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() =>
            onPageChange(page + 1)
          }
        >
          <ChevronRight
            className="size-4"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}