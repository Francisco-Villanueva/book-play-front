export const membersKeys = {
  all: (businessId: string) => ['members', businessId] as const,
  invitation: (token: string) => ['invitations', token] as const,
}
