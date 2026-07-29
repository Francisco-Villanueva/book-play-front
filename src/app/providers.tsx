import { type ReactNode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/lib/queryClient'
import { ToastHost } from '@/shared/components/ToastHost'
import { router } from './router'

export function Providers({ children }: { children?: ReactNode }) {
  void children
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* Fuera del router: los toasts sobreviven a la navegación. */}
      <ToastHost />
    </QueryClientProvider>
  )
}
