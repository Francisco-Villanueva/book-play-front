export type PublicStep = 'court' | 'slots' | 'data' | 'success'

export const STEP_NUMBER: Record<PublicStep, number> = {
  court: 1,
  slots: 2,
  data: 3,
  success: 4,
}

export const STEP_LABELS = ['Cancha', 'Horario', 'Datos', 'Listo'] as const

export interface Player {
  name: string
  phone: string
}
