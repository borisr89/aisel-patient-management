'use client';

import {
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/components/auth/auth-provider';
import { AppHeader } from '@/components/layout/app-header';
import { DeletePatientDialog } from '@/components/patients/delete-patient-dialog';
import { PatientDetailsDialog } from '@/components/patients/patient-details-dialog';
import { PatientFormDialog } from '@/components/patients/patient-form-dialog';
import { PaginationControls } from '@/components/patients/pagination-controls';
import { PatientsTable } from '@/components/patients/patients-table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  ApiError,
  getErrorMessage,
} from '@/lib/api-client';
import type { PatientFormValues } from '@/schemas/patient.schema';
import { patientsApi } from '@/services/patients-api';
import {
  PATIENT_SORT_BY,
  SORT_ORDER,
  type PaginatedPatientsResponse,
  type Patient,
  type PatientPayload,
  type PatientSortBy,
  type SortOrder,
} from '@/types/patient';

const INITIAL_RESPONSE: PaginatedPatientsResponse = {
  data: [],
  page: 1,
  limit: 10,
  total: 0,
};

function toPatientPayload(
  values: PatientFormValues,
): PatientPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phoneNumber:
      values.phoneNumber.trim() || undefined,
    dob: values.dob,
  };
}

export function PatientsScreen() {
  const router = useRouter();

  const {
    session,
    logout,
  } = useAuth();

  const token = session?.token;

  const isAdmin =
    session?.user.role === 'admin';

  const [response, setResponse] =
    useState<PaginatedPatientsResponse>(
      INITIAL_RESPONSE,
    );

  const [search, setSearch] =
    useState('');

  const debouncedSearch =
    useDebouncedValue(search, 300);

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(10);

  const [sortBy, setSortBy] =
    useState<PatientSortBy>(
      PATIENT_SORT_BY.LAST_NAME,
    );

  const [sortOrder, setSortOrder] =
    useState<SortOrder>(
      SORT_ORDER.ASC,
    );

  const [reloadKey, setReloadKey] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [formOpen, setFormOpen] =
    useState(false);

  const [
    editingPatient,
    setEditingPatient,
  ] = useState<Patient | null>(null);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    detailsPatient,
    setDetailsPatient,
  ] = useState<Patient | null>(null);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    patientToDelete,
    setPatientToDelete,
  ] = useState<Patient | null>(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const handleUnauthorized =
    useCallback((): void => {
      logout();
      router.replace('/login');
    }, [logout, router]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller =
      new AbortController();

    void patientsApi
      .list(
        token,
        {
          search: debouncedSearch,
          page,
          limit,
          sortBy,
          sortOrder,
        },
        controller.signal,
      )
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }

        setResponse(result);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        if (
          loadError instanceof DOMException &&
          loadError.name === 'AbortError'
        ) {
          return;
        }

        if (
          loadError instanceof ApiError &&
          loadError.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        setError(
          getErrorMessage(loadError),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    debouncedSearch,
    handleUnauthorized,
    limit,
    page,
    reloadKey,
    sortBy,
    sortOrder,
    token,
  ]);

  function prepareForLoading(): void {
    setIsLoading(true);
    setError(null);
  }

  function requestReload(): void {
    prepareForLoading();

    setReloadKey(
      (current) => current + 1,
    );
  }

  function handleSearchChange(
    value: string,
  ): void {
    prepareForLoading();
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(
    nextPage: number,
  ): void {
    prepareForLoading();
    setPage(nextPage);
  }

  function handleLimitChange(
    nextLimit: number,
  ): void {
    prepareForLoading();
    setLimit(nextLimit);
    setPage(1);
  }

  function handleSort(
    column: PatientSortBy,
  ): void {
    prepareForLoading();
    setPage(1);

    if (sortBy === column) {
      setSortOrder((current) =>
        current === SORT_ORDER.ASC
          ? SORT_ORDER.DESC
          : SORT_ORDER.ASC,
      );

      return;
    }

    setSortBy(column);
    setSortOrder(SORT_ORDER.ASC);
  }

  function openCreateDialog(): void {
    setEditingPatient(null);
    setFormOpen(true);
  }

  function openEditDialog(
    patient: Patient,
  ): void {
    setEditingPatient(patient);
    setFormOpen(true);
  }

  function openDetailsDialog(
    patient: Patient,
  ): void {
    setDetailsPatient(patient);
    setDetailsOpen(true);
  }

  function openDeleteDialog(
    patient: Patient,
  ): void {
    setPatientToDelete(patient);
    setDeleteOpen(true);
  }

  async function submitPatient(
    values: PatientFormValues,
  ): Promise<void> {
    if (!token) {
      return;
    }

    try {
      const payload =
        toPatientPayload(values);

      if (editingPatient) {
        await patientsApi.update(
          token,
          editingPatient.id,
          payload,
        );

        toast.success(
          'Patient updated successfully.',
        );
      } else {
        await patientsApi.create(
          token,
          payload,
        );

        toast.success(
          'Patient created successfully.',
        );
      }

      setFormOpen(false);
      setEditingPatient(null);

      requestReload();
    } catch (
      submissionError: unknown
    ) {
      if (
        submissionError instanceof
          ApiError &&
        submissionError.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(
          submissionError,
        ),
      );
    }
  }

  async function deletePatient():
    Promise<void> {
    if (!token || !patientToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await patientsApi.remove(
        token,
        patientToDelete.id,
      );

      toast.success(
        'Patient deleted successfully.',
      );

      setDeleteOpen(false);
      setPatientToDelete(null);

      const deletedLastItemOnPage =
        response.data.length === 1 &&
        page > 1;

      if (deletedLastItemOnPage) {
        prepareForLoading();

        setPage(
          (current) => current - 1,
        );
      } else {
        requestReload();
      }
    } catch (
      deleteError: unknown
    ) {
      if (
        deleteError instanceof ApiError &&
        deleteError.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      toast.error(
        getErrorMessage(deleteError),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Patients
            </h1>

            <p className="text-muted-foreground">
              Search, review and manage
              patient records.
            </p>
          </div>

          {isAdmin && (
            <Button
              type="button"
              onClick={openCreateDialog}
            >
              <Plus
                className="mr-2 size-4"
                aria-hidden="true"
              />

              Add patient
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <Input
                  value={search}
                  onChange={(event) => {
                    handleSearchChange(
                      event.target.value,
                    );
                  }}
                  placeholder="Search patients..."
                  aria-label="Search patients"
                  className="pl-9"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={requestReload}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${
                    isLoading
                      ? 'animate-spin'
                      : ''
                  }`}
                  aria-hidden="true"
                />

                Refresh
              </Button>
            </div>

            {error ? (
              <div className="p-4">
                <Alert
                  variant="destructive"
                  role="alert"
                >
                  <AlertTitle>
                    Unable to load
                    patients
                  </AlertTitle>

                  <AlertDescription className="space-y-3">
                    <p>{error}</p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={
                        requestReload
                      }
                    >
                      Try again
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            ) : !isLoading &&
              response.data.length ===
                0 ? (
              <div className="p-10 text-center">
                <h2 className="font-medium">
                  No patients found
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {debouncedSearch
                    ? 'Try changing your search.'
                    : 'There are no patient records yet.'}
                </p>

                {isAdmin &&
                  !debouncedSearch && (
                    <Button
                      type="button"
                      className="mt-4"
                      onClick={
                        openCreateDialog
                      }
                    >
                      Add first patient
                    </Button>
                  )}
              </div>
            ) : (
              <>
                <PatientsTable
                  patients={
                    response.data
                  }
                  isLoading={
                    isLoading
                  }
                  isAdmin={isAdmin}
                  sortBy={sortBy}
                  sortOrder={
                    sortOrder
                  }
                  onSort={handleSort}
                  onView={
                    openDetailsDialog
                  }
                  onEdit={
                    openEditDialog
                  }
                  onDelete={
                    openDeleteDialog
                  }
                />

                {!isLoading && (
                  <PaginationControls
                    page={page}
                    limit={limit}
                    total={
                      response.total
                    }
                    onPageChange={
                      handlePageChange
                    }
                    onLimitChange={
                      handleLimitChange
                    }
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
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setEditingPatient(null);
          }
        }}
        onSubmit={submitPatient}
      />

      <PatientDetailsDialog
        open={detailsOpen}
        patient={detailsPatient}
        onOpenChange={(open) => {
          setDetailsOpen(open);

          if (!open) {
            setDetailsPatient(null);
          }
        }}
      />

      <DeletePatientDialog
        open={deleteOpen}
        patient={patientToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setPatientToDelete(null);
          }
        }}
        onConfirm={deletePatient}
      />
    </div>
  );
}
