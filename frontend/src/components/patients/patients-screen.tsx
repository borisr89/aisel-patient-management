'use client';

import { Plus, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/components/auth/auth-provider';
import { AppHeader } from '@/components/layout/app-header';
import { DeletePatientDialog } from '@/components/patients/delete-patient-dialog';
import { PatientDetailsDialog } from '@/components/patients/patient-details-dialog';
import { PatientFormDialog } from '@/components/patients/patient-form-dialog';
import { PaginationControls } from '@/components/patients/pagination-controls';
import { PatientsTable } from '@/components/patients/patients-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePatientsData } from '@/hooks/use-patients-data';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import type { PatientFormValues } from '@/schemas/patient.schema';
import { patientsApi } from '@/services/patients-api';
import type { Patient, PatientPayload } from '@/types/patient';

function toPatientPayload(values: PatientFormValues): PatientPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phoneNumber: values.phoneNumber.trim() || undefined,
    dob: values.dob,
  };
}

export function PatientsScreen() {
  const { session } = useAuth();
  const token = session?.token;
  const isAdmin = session?.user.role === 'admin';

  const {
    response,
    search,
    isLoading,
    error,
    sortBy,
    sortOrder,
    page,
    limit,
    handleSearchChange,
    handlePageChange,
    handleLimitChange,
    handleSort,
    reload,
    reloadAfterDelete,
  } = usePatientsData();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPatient, setDetailsPatient] = useState<Patient | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openCreateDialog(): void {
    setEditingPatient(null);
    setFormOpen(true);
  }

  function openEditDialog(patient: Patient): void {
    setEditingPatient(patient);
    setFormOpen(true);
  }

  async function submitPatient(values: PatientFormValues): Promise<void> {
    if (!token) return;

    try {
      const payload = toPatientPayload(values);

      if (editingPatient) {
        await patientsApi.update(token, editingPatient.id, payload);
        toast.success('Patient updated successfully.');
      } else {
        await patientsApi.create(token, payload);
        toast.success('Patient created successfully.');
      }

      setFormOpen(false);
      setEditingPatient(null);
      reload();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  }

  async function deletePatient(): Promise<void> {
    if (!token || !patientToDelete) return;

    setIsDeleting(true);

    try {
      await patientsApi.remove(token, patientToDelete.id);
      toast.success('Patient deleted successfully.');
      setDeleteOpen(false);
      setPatientToDelete(null);
      reloadAfterDelete(response.data.length);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) return;
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">Search, review and manage patient records.</p>
          </div>

          {isAdmin && (
            <Button type="button" onClick={openCreateDialog}>
              <Plus className="mr-2 size-4" aria-hidden="true" />
              Add patient
            </Button>
          )}
        </div>

        {/* Table card */}
        <Card>
          <CardContent className="p-0">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search patients..."
                  aria-label="Search patients"
                  className="pl-9"
                />
              </div>

              <Button type="button" variant="outline" onClick={reload} disabled={isLoading}>
                <RefreshCw className={`mr-2 size-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            </div>

            {/* Content */}
            {error ? (
              <div className="p-4">
                <Alert variant="destructive" role="alert">
                  <AlertTitle>Unable to load patients</AlertTitle>
                  <AlertDescription className="space-y-3">
                    <p>{error}</p>
                    <Button type="button" variant="outline" size="sm" onClick={reload}>
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            ) : !isLoading && response.data.length === 0 ? (
              <div className="p-10 text-center">
                <h2 className="font-medium">No patients found</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search ? 'Try changing your search.' : 'There are no patient records yet.'}
                </p>
                {isAdmin && !search && (
                  <Button type="button" className="mt-4" onClick={openCreateDialog}>
                    Add first patient
                  </Button>
                )}
              </div>
            ) : (
              <>
                <PatientsTable
                  patients={response.data}
                  isLoading={isLoading}
                  isAdmin={isAdmin}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onView={(p) => { setDetailsPatient(p); setDetailsOpen(true); }}
                  onEdit={openEditDialog}
                  onDelete={(p) => { setPatientToDelete(p); setDeleteOpen(true); }}
                />

                {!isLoading && (
                  <PaginationControls
                    page={page}
                    limit={limit}
                    total={response.total}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <PatientFormDialog
        open={formOpen}
        patient={editingPatient}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingPatient(null); }}
        onSubmit={submitPatient}
      />

      <PatientDetailsDialog
        open={detailsOpen}
        patient={detailsPatient}
        onOpenChange={(open) => { setDetailsOpen(open); if (!open) setDetailsPatient(null); }}
      />

      <DeletePatientDialog
        open={deleteOpen}
        patient={patientToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => { setDeleteOpen(open); if (!open) setPatientToDelete(null); }}
        onConfirm={deletePatient}
      />
    </div>
  );
}