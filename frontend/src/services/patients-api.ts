import { apiRequest } from '@/lib/api-client';
import type {
  PaginatedPatientsResponse,
  Patient,
  PatientPayload,
  PatientsQuery,
} from '@/types/patient';

function createPatientsQuery(
  query: PatientsQuery,
): string {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  const search = query.search?.trim();

  if (search) {
    params.set('search', search);
  }

  return params.toString();
}

export const patientsApi = {
  list(
    token: string,
    query: PatientsQuery,
    signal?: AbortSignal,
  ): Promise<PaginatedPatientsResponse> {
    return apiRequest<PaginatedPatientsResponse>(
      `/patients?${createPatientsQuery(query)}`,
      {
        method: 'GET',
        token,
        signal,
      },
    );
  },

  getById(
    token: string,
    id: string,
  ): Promise<Patient> {
    return apiRequest<Patient>(
      `/patients/${id}`,
      {
        method: 'GET',
        token,
      },
    );
  },

  create(
    token: string,
    payload: PatientPayload,
  ): Promise<Patient> {
    return apiRequest<Patient>('/patients', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  },

  update(
    token: string,
    id: string,
    payload: PatientPayload,
  ): Promise<Patient> {
    return apiRequest<Patient>(
      `/patients/${id}`,
      {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
      },
    );
  },

  remove(
    token: string,
    id: string,
  ): Promise<{ ok: true }> {
    return apiRequest<{ ok: true }>(
      `/patients/${id}`,
      {
        method: 'DELETE',
        token,
      },
    );
  },
};
