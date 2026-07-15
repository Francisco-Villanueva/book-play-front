import { z } from 'zod'

// capacity/pricePerHour stay as raw strings here (native number inputs still emit
// strings to RHF) and are parsed to numbers where the payload is built — keeping
// input and output types identical avoids fighting zodResolver's generics under
// exactOptionalPropertyTypes.
export const createCourtSchema = z.object({
  name: z.string().min(1, 'Ingresá el nombre de la cancha'),
  sportType: z.string().min(1, 'Elegí un deporte'),
  surface: z.string().min(1, 'Elegí una superficie'),
  capacity: z.string().optional(),
  isIndoor: z.boolean(),
  hasLighting: z.boolean(),
  pricePerHour: z.string().optional(),
})

export type CreateCourtFormData = z.infer<typeof createCourtSchema>
