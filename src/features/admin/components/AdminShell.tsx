import { type ReactNode, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
  Ticket,
  Users,
  Settings,
  LogOut,
  ChevronsUpDown,
  Bell,
  Plus,
  Search,
  Trophy,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { IconButton } from "@/shared/components/IconButton";
import { TrialBanner } from "@/shared/components/TrialBanner";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useAdminStore } from "../store/adminStore";
import { useCourts } from "@/features/courts/hooks/useCourts";
import { courtColor } from "./courtTypes";
import { NewBookingModal } from "./NewBookingModal";
import { todayISO, formatLongDateEs } from "@/shared/utils/date";

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
  const { sidebarOpen } = useAdminStore();
  const [trialBannerVisible, setTrialBannerVisible] = useState(true);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const TRIAL_DAYS_LEFT = 14;

  const base = `/admin/${businessId}`;
  const activeBusiness = user?.businesses?.find((b) => b.id === businessId);
  const businessLabel =
    activeBusiness?.role === "STAFF" ? "Personal" : "Complejo deportivo";

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
    for (const c of rawCourts ?? []) map[c.id] = c.pricePerHour ?? 0;
    return map;
  }, [rawCourts]);
  const today = todayISO();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

          <button
            type="button"
            className="flex items-center gap-2.5 mx-3.5 mb-3.5 px-3 py-2.5 bg-ink-50 border border-ink-100 rounded-md cursor-pointer text-left"
          >
            <Avatar name={activeBusiness?.name ?? "Complejo"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-caption font-bold text-ink-900 font-body truncate">
                {activeBusiness?.name ?? "Complejo"}
              </p>
              <p className="text-[11px] text-ink-500">{businessLabel}</p>
            </div>
            <ChevronsUpDown
              size={15}
              className="text-ink-400 flex-none"
              aria-hidden
            />
          </button>

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
            <IconButton variant="outline" aria-label="Notificaciones">
              <Bell size={18} />
            </IconButton>
            <Button leftIcon={<Plus size={18} aria-hidden />} onClick={() => setNewBookingOpen(true)} data-testid="shell-new-booking">
              Nueva reserva
            </Button>
          </div>
        </header>

        {trialBannerVisible && (
          <TrialBanner
            daysLeft={TRIAL_DAYS_LEFT}
            onUpgrade={() => navigate(`/admin/${businessId}/upgrade`)}
            onDismiss={() => setTrialBannerVisible(false)}
          />
        )}

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {newBookingOpen && businessId && (
        <NewBookingModal
          businessId={businessId}
          date={today}
          dateLabel={formatLongDateEs(today)}
          courts={courts}
          courtPrices={courtPrices}
          onClose={() => setNewBookingOpen(false)}
          onSaved={() => setNewBookingOpen(false)}
        />
      )}
    </div>
  );
}
