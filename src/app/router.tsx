import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { getPostLoginPath } from '@/features/auth/hooks/useAuth'
import { AppInitializer } from '@/app/AppInitializer'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import BookCourtPage from '@/pages/BookCourtPage'
import ConfirmBookingPage from '@/pages/ConfirmBookingPage'
import BookingSuccessPage from '@/pages/BookingSuccessPage'
import MyBookingsPage from '@/pages/MyBookingsPage'
import BookingDetailPage from '@/pages/BookingDetailPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminAgendaPage from '@/pages/AdminAgendaPage'
import AdminSchedulePage from '@/pages/AdminSchedulePage'
import AdminCourtsPage from '@/pages/AdminCourtsPage'
import AdminReservationsPage from '@/pages/AdminReservationsPage'
import AdminClientsPage from '@/pages/AdminClientsPage'
import AdminSettingsPage from '@/pages/AdminSettingsPage'
import PublicBookingPage from '@/pages/PublicBookingPage'
import GuestBookingCancelPage from '@/pages/GuestBookingCancelPage'
import OnboardingPage from '@/pages/OnboardingPage'
import NotFoundPage from '@/pages/NotFoundPage'
import UnauthorizedPage from '@/pages/UnauthorizedPage'
import ErrorPage from '@/pages/ErrorPage'
import MasterAccountsPage from '@/pages/MasterAccountsPage'
import MasterAccountDetailPage from '@/pages/MasterAccountDetailPage'
import MasterFeaturesPage from '@/pages/MasterFeaturesPage'
import MasterPaymentsPage from '@/pages/MasterPaymentsPage'
import MasterLogsPage from '@/pages/MasterLogsPage'
import MasterUsersPage from '@/pages/MasterUsersPage'
import MasterConfigPage from '@/pages/MasterConfigPage'
import AdminTournamentsPage from '@/pages/AdminTournamentsPage'
import PricingPage from '@/pages/PricingPage'
import ConversionWallPage from '@/pages/ConversionWallPage'
import UpgradeConfirmationPage from '@/pages/UpgradeConfirmationPage'

function RootRedirect() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token) return <Navigate to="/login" replace />
  if (!user) return null // AppInitializer shows loading while session is being restored
  return <Navigate to={getPostLoginPath(user)} replace />
}

export const router = createBrowserRouter([
  {
    element: <AppInitializer />,
    errorElement: <ErrorPage />,
    children: [
      // Root redirect — detects auth state and sends to the right place
      { index: true, element: <RootRedirect /> },

      // Public — no auth required
      { path: '/login',                         element: <LoginPage /> },
      { path: '/register',                      element: <RegisterPage /> },
      { path: '/forgot-password',               element: <ForgotPasswordPage /> },
      { path: '/reset-password',                element: <ResetPasswordPage /> },
      { path: '/businesses/:businessId/book',   element: <PublicBookingPage /> },
      { path: '/businesses/:businessId/bookings/:bookingId/cancel', element: <GuestBookingCancelPage /> },
      { path: '/unauthorized',                  element: <UnauthorizedPage /> },

      // Requires authentication — any logged-in user
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/onboarding',                           element: <OnboardingPage /> },

          /* Player app */
          { path: '/dashboard',                            element: <DashboardPage /> },
          { path: '/book/:courtId',                        element: <BookCourtPage /> },
          { path: '/book/:courtId/confirm',                element: <ConfirmBookingPage /> },
          { path: '/book/:courtId/success',                element: <BookingSuccessPage /> },
          { path: '/my-bookings',                          element: <MyBookingsPage /> },
          { path: '/my-bookings/:bookingId',               element: <BookingDetailPage /> },
          { path: '/profile',                              element: <ProfilePage /> },

          /* Admin panel — business-level role enforced by the backend */
          { path: '/admin/:businessId',                    element: <AdminDashboardPage /> },
          { path: '/admin/:businessId/agenda',             element: <AdminAgendaPage /> },
          { path: '/admin/:businessId/schedule',           element: <AdminSchedulePage /> },
          { path: '/admin/:businessId/courts',             element: <AdminCourtsPage /> },
          { path: '/admin/:businessId/bookings',           element: <AdminReservationsPage /> },
          { path: '/admin/:businessId/clients',            element: <AdminClientsPage /> },
          { path: '/admin/:businessId/tournaments',        element: <AdminTournamentsPage /> },
          { path: '/admin/:businessId/settings',           element: <AdminSettingsPage /> },
          { path: '/admin/:businessId/upgrade',            element: <PricingPage /> },
          { path: '/admin/:businessId/upgrade/confirm',    element: <UpgradeConfirmationPage /> },
          { path: '/admin/:businessId/suspended',          element: <ConversionWallPage /> },
        ],
      },

      // Requires MASTER global role
      {
        element: <ProtectedRoute allowedRoles={['MASTER']} />,
        children: [
          { path: '/master/businesses',              element: <MasterAccountsPage /> },
          { path: '/master/businesses/:businessId', element: <MasterAccountDetailPage /> },
          { path: '/master/features',               element: <MasterFeaturesPage /> },
          { path: '/master/payments',               element: <MasterPaymentsPage /> },
          { path: '/master/logs',                   element: <MasterLogsPage /> },
          { path: '/master/users',                  element: <MasterUsersPage /> },
          { path: '/master/config',                 element: <MasterConfigPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
