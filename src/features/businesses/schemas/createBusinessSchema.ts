import { z } from 'zod'

export const createBusinessSchema = z.object({
  name: z.string().min(3, 'Ingresá el nombre de tu complejo (mínimo 3 caracteres)'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  slotDuration: z.union([z.literal(30), z.literal(60), z.literal(90), z.literal(120)]),
})

export type CreateBusinessFormData = z.infer<typeof createBusinessSchema>
