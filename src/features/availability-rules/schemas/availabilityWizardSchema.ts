import { z } from 'zod'

export const availabilityWizardSchema = z
  .object({
    days: z.array(z.number().min(0).max(6)).min(1, 'Elegí al menos un día'),
    startTime: z.string().min(1, 'Ingresá el horario de apertura'),
    endTime: z.string().min(1, 'Ingresá el horario de cierre'),
  })
  .refine((data) => data.startTime < data.endTime, {
    path: ['endTime'],
    message: 'El cierre debe ser posterior a la apertura',
  })

export type AvailabilityWizardFormData = z.infer<typeof availabilityWizardSchema>
