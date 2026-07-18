export const businessesKeys = {
  all: ['businesses'] as const,
  detail: (businessId: string) => ['businesses', businessId] as const,
  publicDetail: (businessId: string) => ['businesses', businessId, 'public'] as const,
  search: (q: string) => ['businesses', 'search', q] as const,
}
