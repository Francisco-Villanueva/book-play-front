export const courtsKeys = {
  all: (businessId: string) => ['courts', businessId] as const,
  detail: (businessId: string, courtId: string) => ['courts', businessId, courtId] as const,
}
