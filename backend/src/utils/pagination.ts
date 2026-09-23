export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

export function parsePagination(params: {
  page?: unknown;
  limit?: unknown;
}): PaginationResult {
  const page = Math.max(1, parseInt(String(params.page ?? 1), 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(params.limit ?? DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  );
  return { skip: (page - 1) * limit, limit, page };
}

export function buildMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
