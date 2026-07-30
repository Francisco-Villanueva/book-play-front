import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  Repeat,
  Ticket,
  Users,
  Settings,
  LogOut,
  Bell,
  Plus,
  Search,
  Trophy,
} from "lucide-react";
import { BusinessPicker } from "./BusinessPicker";
import { cn } from "@/shared/utils/cn";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { IconButton } from "@/shared/components/IconButton";
import { SubscriptionBanner } from "@/shared/components/SubscriptionBanner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAdminStore } from "../store/adminStore";
import { useCourts } from "@/features/courts/hooks/useCourts";
import { useSubscriptionAccess } from "@/features/billing/hooks/useBilling";
import { courtColor } from "./courtTypes";
import { NewBookingModal } from "./NewBookingModal";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import { AdminMobileChrome } from "./mobile/AdminMobileChrome";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { todayISO } from "@/shared/utils/date";

const NAV = [
  { key: "resumen", icon: LayoutDashboard, label: "Resumen", path: "" },
  { key: "agenda", icon: CalendarDays, label: "Agenda", path: "/agenda" },
  {
    key: "semana",
    icon: CalendarRange,
    label: "Vista semanal",
    path: "/schedule",
  },
  { key: "canchas", icon: LayoutGrid, label: "Canchas", path: "/courts" },
  { key: "reservas", icon: Ticket, label: "Reservas", path: "/bookings" },
  { key: "fijos", icon: Repeat, label: "Turnos fijos", path: "/turnos-fijos" },
  { key: "clientes", icon: Users, label: "Clientes", path: "/clients" },
  {
    key: "torneos",
    icon: Trophy,
    label: "Torneos",
    path: "/tournaments",
    badge: "Pronto",
  },
  { key: "config", icon: Settings, label: "Configuración", path: "/settings" },
];

interface AdminShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminShell({ children, title, subtitle }: AdminShellProps) {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setActiveBusinessId } = useAdminStore();
  const isMobile = useIsMobile();

  // Corre también en mobile: el retorno anticipado a AdminMobileChrome está más
  // abajo, así que este efecto cubre los dos shells.
  useEffect(() => {
    if (businessId) setActiveBusinessId(businessId);
  }, [businessId, setActiveBusinessId]);

  const [expiryBannerDismissed, setExpiryBannerDismissed] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifications, isLoading: notificationsLoading } =
    useNotifications(businessId);
  const markRead = useMarkNotificationRead(businessId ?? "");
  const markAllRead = useMarkAllNotificationsRead(businessId ?? "");
  const unreadCount = notifications?.unreadCount ?? 0;

  // El aviso lo ven los tres roles; sólo el OWNER puede pagar.
  const { data: access } = useSubscriptionAccess(businessId);
  const readOnly = access?.accessLevel === "READ_ONLY";
  const isOwner =
    user?.businesses?.find((b) => b.id === businessId)?.role === "OWNER";

  const base = `/admin/${businessId}`;

  const { data: rawCourts } = useCourts(businessId);
  const courts = useMemo(
    () =>
      (rawCourts ?? [])
        .filter((c) => c.isActive)
        .map((c) => ({
          id: c.id,
          name: c.name,
          sport: c.sportType ?? "—",
          color: courtColor(c.sportType),
        })),
    [rawCourts],
  );
  const courtPrices = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of rawCourts ?? []) map[c.id] = c.pricePerSlot ?? 0;
    return map;
  }, [rawCourts]);
  const courtDurations = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of rawCourts ?? []) map[c.id] = c.slotDuration;
    return map;
  }, [rawCourts]);
  const today = todayISO();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Por debajo de `md` el panel cambia de shell entero: barra de pestañas y hojas
  // en vez de sidebar y modales. El título y el subtítulo los pone cada pantalla.
  if (isMobile) {
    return <AdminMobileChrome>{children}</AdminMobileChrome>;
  }

  return (
    <div className="flex h-full" style={{ background: "var(--surface-page)" }}>
      {sidebarOpen && (
        <aside
          className="flex-none flex flex-col bg-white border-r border-ink-100"
          style={{ width: 248 }}
        >
          <div className="p-5 pb-4">
            <img src="/logo-wordmark.svg" height="32" alt="Book & Play" />
          </div>

          <BusinessPicker
            businessId={businessId ?? ""}
            businesses={user?.businesses ?? []}
          />

          <nav className="flex-1 px-3.5 flex flex-col gap-0.5">
            {NAV.map(({ key, icon: Icon, label, path, badge }) => {
              const href = base + path;
              const active =
                pathname === href || (path !== "" && pathname.startsWith(href));
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(href)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-md border-none cursor-pointer w-full text-left",
                    "font-body text-body-sm transition-colors duration-[120ms]",
                    active
                      ? "bg-green-50 text-green-700 font-bold"
                      : "bg-transparent text-ink-700 font-medium hover:bg-ink-50",
                  )}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.3 : 2}
                    className="flex-none"
                    aria-hidden
                  />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-100">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3.5 border-t border-ink-100 flex items-center gap-2.5">
            <Avatar name={user?.name ?? "Usuario"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-caption font-semibold text-ink-900 truncate">
                {user?.name ?? "Administrador"}
              </p>
              <p className="text-[11px] text-ink-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="border-none bg-transparent cursor-pointer text-ink-400 hover:text-ink-600"
            >
              <LogOut size={17} aria-hidden />
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-none h-[68px] flex items-center justify-between px-7 bg-white border-b border-ink-100">
          <div>
            <h1 className="font-display font-bold text-[22px] text-ink-900 tracking-tight leading-none">
              {title}
            </h1>
            {subtitle && (
              <p className="text-caption text-ink-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 h-10 px-3.5 bg-ink-50 rounded-full text-ink-400">
              <Search size={17} aria-hidden />
              <span className="text-caption text-ink-400 font-body">
                Buscar reserva o cliente…
              </span>
            </div>
            <div className="relative">
              <IconButton
                variant="outline"
                aria-label={
                  unreadCount > 0
                    ? `Notificaciones (${unreadCount} sin leer)`
                    : "Notificaciones"
                }
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((v) => !v)}
                data-testid="notifications-bell"
              >
                <Bell size={18} />
              </IconButton>
              {unreadCount > 0 && (
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center pointer-events-none"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {notificationsOpen && (
                <NotificationsPanel
                  notifications={notifications?.data ?? []}
                  unreadCount={unreadCount}
                  isLoading={notificationsLoading}
                  onClose={() => setNotificationsOpen(false)}
                  onMarkAllRead={() => markAllRead.mutate()}
                  onSelect={(n) => {
                    if (!n.readAt) markRead.mutate(n.id);
                    setNotificationsOpen(false);
                    navigate(`${base}/bookings`);
                  }}
                />
              )}
            </div>
            <Button
              leftIcon={<Plus size={18} aria-hidden />}
              onClick={() => setNewBookingOpen(true)}
              disabled={readOnly}
              title={
                readOnly
                  ? "Reactivá tu plan para volver a cargar reservas"
                  : undefined
              }
              data-testid="shell-new-booking"
            >
              Nueva reserva
            </Button>
          </div>
        </header>

        {!expiryBannerDismissed && (
          <SubscriptionBanner
            daysLeft={access?.daysUntilExpiry ?? null}
            readOnly={readOnly}
            canPay={!!isOwner}
            onUpgrade={() => navigate(`/admin/${businessId}/upgrade`)}
            onDismiss={() => setExpiryBannerDismissed(true)}
          />
        )}

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {newBookingOpen && businessId && (
        <NewBookingModal
          businessId={businessId}
          date={today}
          courts={courts}
          courtPrices={courtPrices}
          courtDurations={courtDurations}
          onClose={() => setNewBookingOpen(false)}
          onSaved={() => setNewBookingOpen(false)}
        />
      )}
    </div>
  );
}
