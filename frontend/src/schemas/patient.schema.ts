import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required.')
    .max(
      100,
      'First name must contain at most 100 characters.',
    ),

  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(
      100,
      'Last name must contain at most 100 characters.',
    ),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .max(
      254,
      'Email must contain at most 254 characters.',
    ),

  phoneNumber: z
    .string()
    .trim()
    .max(
      30,
      'Phone number must contain at most 30 characters.',
    ),

  dob: z
    .string()
    .min(1, 'Date of birth is required.')
    .refine(
      (value) =>
        !Number.isNaN(
          new Date(
            `${value}T00:00:00.000Z`,
          ).getTime(),
        ),
      'Enter a valid date of birth.',
    )
    .refine(
      (value) =>
        new Date(
          `${value}T00:00:00.000Z`,
        ) <= new Date(),
      'Date of birth cannot be in the future.',
    ),
});

export type PatientFormValues = z.infer<
  typeof patientSchema
>;