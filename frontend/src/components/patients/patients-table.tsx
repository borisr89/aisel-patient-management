'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/formatters';
import {
  PATIENT_SORT_BY,
  Patient,
  PatientSortBy,
  SortOrder,
} from '@/types/patient';

interface PatientsTableProps {
  patients: Patient[];
  isLoading: boolean;
  isAdmin: boolean;
  sortBy: PatientSortBy;
  sortOrder: SortOrder;
  onSort: (column: PatientSortBy) => void;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

interface SortableHeaderProps {
  label: string;
  column: PatientSortBy;
  sortBy: PatientSortBy;
  sortOrder: SortOrder;
  onSort: (column: PatientSortBy) => void;
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortBy === column;

  const Icon = !isActive
    ? ArrowUpDown
    : sortOrder === 'asc'
      ? ArrowUp
      : ArrowDown;

  return (
    <Button
      type="button"
      variant="ghost"
      className="-ml-3"
      onClick={() => onSort(column)}
    >
      {label}

      <Icon
        className="ml-2 size-4"
        aria-hidden="true"
      />
    </Button>
  );
}

export function PatientsTable({
  patients,
  isLoading,
  isAdmin,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDelete,
}: PatientsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortableHeader
                label="First name"
                column={PATIENT_SORT_BY.FIRST_NAME}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </TableHead>

            <TableHead>
              <SortableHeader
                label="Last name"
                column={PATIENT_SORT_BY.LAST_NAME}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </TableHead>

            <TableHead>
              <SortableHeader
                label="Email"
                column={PATIENT_SORT_BY.EMAIL}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </TableHead>

            <TableHead>Phone</TableHead>

            <TableHead>
              <SortableHeader
                label="Date of birth"
                column={PATIENT_SORT_BY.DOB}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            </TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map(
              (_, index) => (
                <TableRow key={index}>
                  {Array.from({
                    length: 6,
                  }).map((__, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ),
            )}

          {!isLoading &&
            patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  {patient.firstName}
                </TableCell>

                <TableCell>
                  {patient.lastName}
                </TableCell>

                <TableCell>
                  {patient.email}
                </TableCell>

                <TableCell>
                  {patient.phoneNumber ??
                    'Not provided'}
                </TableCell>

                <TableCell>
                  {formatDate(patient.dob)}
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`View ${patient.firstName} ${patient.lastName}`}
                      onClick={() =>
                        onView(patient)
                      }
                    >
                      <Eye
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Button>

                    {isAdmin && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${patient.firstName} ${patient.lastName}`}
                          onClick={() =>
                            onEdit(patient)
                          }
                        >
                          <Pencil
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${patient.firstName} ${patient.lastName}`}
                          onClick={() =>
                            onDelete(patient)
                          }
                        >
                          <Trash2
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
