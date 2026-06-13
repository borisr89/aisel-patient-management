import type { Patient } from '../../generated/prisma/client';

export interface PaginatedPatientsResponse {
  data: Patient[];
  page: number;
  limit: number;
  total: number;
}
