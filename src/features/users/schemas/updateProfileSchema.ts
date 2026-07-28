import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Ingresá tu nombre completo'),
  phone: z.string().optional(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
