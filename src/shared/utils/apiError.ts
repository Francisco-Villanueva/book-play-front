export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const data = (error as { response?: { data?: { message?: string | string[]; statusCode?: number } } }).response?.data
    if (data?.statusCode === 401) return 'Email o contraseña incorrectos.'
    if (data?.statusCode === 409) {
      const msg = Array.isArray(data.message) ? (data.message[0] ?? '') : (data.message ?? '')
      if (msg.toLowerCase().includes('email')) return 'El email ya está registrado.'
      if (msg.toLowerCase().includes('username')) return 'El nombre de usuario ya está en uso.'
    }
    if (data?.message) {
      const msg = Array.isArray(data.message) ? (data.message[0] ?? '') : data.message
      return msg
    }
  }
  return 'Ocurrió un error. Intentá de nuevo.'
}
