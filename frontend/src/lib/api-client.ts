import type { ApiErrorBody } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: ApiErrorBody | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not configured.',
    );
  }

  return url.replace(/\/$/, '');
}

function resolveErrorMessage(
  body: ApiErrorBody | null,
  fallback: string,
): string {
  if (!body?.message) {
    return fallback;
  }

  if (Array.isArray(body.message)) {
    return body.message.join(' ');
  }

  return body.message;
}

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set('Accept', 'application/json');

  if (requestOptions.body) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set(
      'Authorization',
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${getApiBaseUrl()}${path}`,
    {
      ...requestOptions,
      headers: requestHeaders,
      cache: 'no-store',
    },
  );

  const body = (await response
    .json()
    .catch(() => null)) as ApiErrorBody | T | null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;

    throw new ApiError(
      resolveErrorMessage(
        errorBody,
        `Request failed with status ${response.status}.`,
      ),
      response.status,
      errorBody,
    );
  }

  return body as T;
}

export function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
