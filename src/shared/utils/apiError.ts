interface ApiErrorData {
  /** Formato estándar del backend (AllExceptionsFilter). */
  error?: { code?: string; message?: string }
  /** Formato por defecto de Nest, por si alguna respuesta no pasa por el filtro. */
  message?: string | string[]
  statusCode?: number
}

export function getApiErrorMessage(error: unknown): string {
  const fallback = 'Ocurrió un error. Intentá de nuevo.'
  if (!error || typeof error !== 'object' || !('response' in error)) return fallback

  const response = (error as { response?: { status?: number; data?: ApiErrorData } }).response
  const data = response?.data
  const status = response?.status ?? data?.statusCode

  const raw =
    data?.error?.message ??
    (Array.isArray(data?.message) ? data.message[0] : data?.message) ??
    ''

  if (status === 401) return 'Email o contraseña incorrectos.'
  if (status === 409) {
    const lower = raw.toLowerCase()
    if (lower.includes('email')) return 'El email ya está registrado.'
    if (lower.includes('username')) return 'El nombre de usuario ya está en uso.'
  }

  return raw || fallback
}
