export const businessesKeys = {
  all: ['businesses'] as const,
  detail: (businessId: string) => ['businesses', businessId] as const,
  search: (q: string) => ['businesses', 'search', q] as const,
}
