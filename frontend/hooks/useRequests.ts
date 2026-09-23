"use client";

import { useState, useEffect, useCallback } from "react";
import { requestService, RequestsResult } from "@/services/request.service";
import { RequestFilters } from "@/types/request";
import { FrontendError } from "@/services/api";

interface UseRequestsReturn extends RequestsResult {
  loading: boolean;
  error: FrontendError | null;
  refetch: () => void;
}

export function useRequests(filters?: RequestFilters): UseRequestsReturn {
  const [data, setData] = useState<RequestsResult>({
    data: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FrontendError | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestService.getRequests(filters);
      setData(result);
    } catch (err) {
      setError(err as FrontendError);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}
