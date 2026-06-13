'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import {
  Controller,
  useForm,
} from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toDateInputValue } from '@/lib/formatters';
import {
  patientSchema,
  type PatientFormValues,
} from '@/schemas/patient.schema';
import type { Patient } from '@/types/patient';

interface PatientFormDialogProps {
  open: boolean;
  patient: Patient | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: PatientFormValues,
  ) => Promise<void>;
}

const EMPTY_VALUES: PatientFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dob: '',
};

export function PatientFormDialog({
  open,
  patient,
  onOpenChange,
  onSubmit,
}: PatientFormDialogProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: EMPTY_VALUES,
  });

  const isEditMode = patient !== null;
  const isSubmitting =
    form.formState.isSubmitting;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (patient) {
      form.reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phoneNumber:
          patient.phoneNumber ?? '',
        dob: toDateInputValue(patient.dob),
      });

      return;
    }

    form.reset(EMPTY_VALUES);
  }, [form, open, patient]);

  async function handleSubmit(
    values: PatientFormValues,
  ): Promise<void> {
    await onSubmit(values);
  }

  function handleOpenChange(
    nextOpen: boolean,
  ): void {
    if (isSubmitting) {
      return;
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? 'Edit patient'
              : 'Create patient'}
          </DialogTitle>

          <DialogDescription>
            {isEditMode
              ? 'Update the complete patient record.'
              : 'Enter the patient information below.'}
          </DialogDescription>
        </DialogHeader>

        <form
          id="patient-form"
          onSubmit={form.handleSubmit(
            handleSubmit,
          )}
          noValidate
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="firstName"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel
                      htmlFor="patient-first-name"
                    >
                      First name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="patient-first-name"
                      type="text"
                      autoComplete="given-name"
                      aria-invalid={
                        fieldState.invalid
                      }
                      disabled={isSubmitting}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel
                      htmlFor="patient-last-name"
                    >
                      Last name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="patient-last-name"
                      type="text"
                      autoComplete="family-name"
                      aria-invalid={
                        fieldState.invalid
                      }
                      disabled={isSubmitting}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="email"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor="patient-email"
                  >
                    Email
                  </FieldLabel>

                  <Input
                    {...field}
                    id="patient-email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={
                      fieldState.invalid
                    }
                    disabled={isSubmitting}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phoneNumber"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor="patient-phone-number"
                  >
                    Phone number
                  </FieldLabel>

                  <Input
                    {...field}
                    id="patient-phone-number"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+45 20 30 40 50"
                    aria-invalid={
                      fieldState.invalid
                    }
                    disabled={isSubmitting}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="dob"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel
                    htmlFor="patient-date-of-birth"
                  >
                    Date of birth
                  </FieldLabel>

                  <Input
                    {...field}
                    id="patient-date-of-birth"
                    type="date"
                    aria-invalid={
                      fieldState.invalid
                    }
                    disabled={isSubmitting}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              handleOpenChange(false)
            }
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="patient-form"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}

            {isSubmitting
              ? 'Saving...'
              : isEditMode
                ? 'Save changes'
                : 'Create patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
