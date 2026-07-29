import { MutationCache, QueryClient } from '@tanstack/react-query'
import { flashToast } from '@/shared/store/toastStore'
import { getApiErrorMessage } from '@/shared/utils/apiError'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /**
       * La pantalla ya muestra el mensaje al lado del formulario (`mutation.error`),
       * así que el toast global sería un duplicado. Solo para formularios: si una
       * mutation falla en silencio, va sin esto.
       */
      inlineError?: boolean
    }
  }
}

export const queryClient = new QueryClient({
  // Red de seguridad: por defecto toda mutation que falla avisa. Sin esto, una
  // mutation sin UI de error falla en silencio y el usuario cree que guardó.
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.inlineError) return
      // Un 401 ya dispara logout + redirect en el interceptor de apiClient:
      // el toast se perdería en la navegación.
      if ((error as { response?: { status?: number } }).response?.status === 401) return
      flashToast(getApiErrorMessage(error), { kind: 'error' })
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
