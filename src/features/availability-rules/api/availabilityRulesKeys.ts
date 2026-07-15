export const availabilityRulesKeys = {
  all: (businessId: string) => ['availability-rules', businessId] as const,
}
