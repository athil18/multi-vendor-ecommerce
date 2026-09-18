export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  query: Record<string, any>,
  defaultLimit = 20,
  maxLimit = 100
): PaginationResult {
  const rawPage = typeof query.page === 'string' ? query.page : '1';
  const rawLimit = typeof query.limit === 'string' ? query.limit : String(defaultLimit);

  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(rawLimit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
