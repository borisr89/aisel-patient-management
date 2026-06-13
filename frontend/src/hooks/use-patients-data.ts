'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth/auth-provider';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import { patientsApi } from '@/services/patients-api';
import {
  PATIENT_SORT_BY,
  SORT_ORDER,
  type PaginatedPatientsResponse,
  type PatientSortBy,
  type SortOrder,
} from '@/types/patient';

const INITIAL_RESPONSE: PaginatedPatientsResponse = {
  data: [],
  page: 1,
  limit: 10,
  total: 0,
};

interface UsePatientsDataReturn {
  response: PaginatedPatientsResponse;
  search: string;
  page: number;
  limit: number;
  sortBy: PatientSortBy;
  sortOrder: SortOrder;
  isLoading: boolean;
  error: string | null;
  handleSearchChange: (value: string) => void;
  handlePageChange: (page: number) => void;
  handleLimitChange: (limit: number) => void;
  handleSort: (column: PatientSortBy) => void;
  reload: () => void;
  reloadAfterDelete: (currentPageCount: number) => void;
}

export function usePatientsData(): UsePatientsDataReturn {
  const router = useRouter();
  const { session, logout } = useAuth();
  const token = session?.token;

  const [response, setResponse] = useState<PaginatedPatientsResponse>(INITIAL_RESPONSE);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<PatientSortBy>(PATIENT_SORT_BY.LAST_NAME);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SORT_ORDER.ASC);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const handleUnauthorized = useCallback((): void => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    void patientsApi
      .list(token, { search: debouncedSearch, page, limit, sortBy, sortOrder }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setResponse(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ApiError && err.status === 401) { handleUnauthorized(); return; }
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, handleUnauthorized, limit, page, reloadKey, sortBy, sortOrder, token]);

  function startLoading(): void {
    setIsLoading(true);
    setError(null);
  }

  function reload(): void {
    startLoading();
    setReloadKey((k) => k + 1);
  }

  function reloadAfterDelete(currentPageCount: number): void {
    startLoading();
    if (currentPageCount === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      setReloadKey((k) => k + 1);
    }
  }

  function handleSearchChange(value: string): void {
    startLoading();
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(nextPage: number): void {
    startLoading();
    setPage(nextPage);
  }

  function handleLimitChange(nextLimit: number): void {
    startLoading();
    setLimit(nextLimit);
    setPage(1);
  }

  function handleSort(column: PatientSortBy): void {
    startLoading();
    setPage(1);
    if (sortBy === column) {
      setSortOrder((c) => c === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC);
      return;
    }
    setSortBy(column);
    setSortOrder(SORT_ORDER.ASC);
  }

  return {
    response,
    search,
    page,
    limit,
    sortBy,
    sortOrder,
    isLoading,
    error,
    handleSearchChange,
    handlePageChange,
    handleLimitChange,
    handleSort,
    reload,
    reloadAfterDelete,
  };
}