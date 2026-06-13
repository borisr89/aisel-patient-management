export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  dob: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPatientsResponse {
  data: Patient[];
  page: number;
  limit: number;
  total: number;
}

export const PATIENT_SORT_BY = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  EMAIL: 'email',
  DOB: 'dob',
  CREATED_AT: 'createdAt',
} as const;

export type PatientSortBy =
  (typeof PATIENT_SORT_BY)[keyof typeof PATIENT_SORT_BY];

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder =
  (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

export interface PatientsQuery {
  search?: string;
  page: number;
  limit: number;
  sortBy: PatientSortBy;
  sortOrder: SortOrder;
}

export interface PatientPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dob: string;
}
