import { z } from 'zod'

// OWNER queda fuera a propósito: el backend rechaza asignar ese rol (sólo lo tiene
// quien creó el complejo).
export const inviteMemberSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  role: z.enum(['ADMIN', 'STAFF'], { errorMap: () => ({ message: 'Elegí un rol' }) }),
})

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>
