'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/formatters';
import type { Patient } from '@/types/patient';

interface PatientDetailsDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: PatientDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Patient details
          </DialogTitle>

          <DialogDescription>
            Full patient record.
          </DialogDescription>
        </DialogHeader>

        {patient && (
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                First name
              </dt>
              <dd>{patient.firstName}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Last name
              </dt>
              <dd>{patient.lastName}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Email
              </dt>
              <dd className="break-all">
                {patient.email}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Phone number
              </dt>
              <dd>
                {patient.phoneNumber ?? 'Not provided'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Date of birth
              </dt>
              <dd>{formatDate(patient.dob)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Created
              </dt>
              <dd>
                {formatDate(patient.createdAt)}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">
                Patient ID
              </dt>
              <dd className="break-all font-mono text-sm">
                {patient.id}
              </dd>
            </div>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  );
}