import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Clock, Trash2, Plus, CheckCircle, Building2, CalendarOff, CreditCard } from 'lucide-react'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'
import { BillingSettingsPanel } from '@/features/billing/components/BillingSettingsPanel'
import { useBusiness, useUpdateBusiness } from '@/features/businesses/hooks/useBusinesses'
import { useCourts } from '@/features/courts/hooks/useCourts'
import {
  useAvailabilityRules, useCreateAvailabilityRulesBatch, useDeleteAvailabilityRule,
} from '@/features/availability-rules/hooks/useAvailabilityRules'
import {
  useExceptionRules, useCreateExceptionRule, useDeleteExceptionRule,
} from '@/features/exception-rules/hooks/useExceptionRules'
import { getApiErrorMessage } from '@/shared/utils/apiError'
import type { AvailabilityRule, ExceptionRule } from '@/shared/types/domain'

const CFG_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const CFG_HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
const TIMEZONES = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Montevideo', label: 'Montevideo' },
  { value: 'America/Santiago', label: 'Santiago' },
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Bogota', label: 'Bogotá' },
]

const cfgFld: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 'var(--r-md)',
  border: '1.5px solid var(--border-default)', background: 'var(--surface-card)',
  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-strong)', boxSizing: 'border-box',
  outline: 'none',
}
const cfgLbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }

// ── Tab 1: General ─────────────────────────────────────────────────
function GeneralTab({ businessId }: { businessId: string }) {
  const { data: business, isLoading } = useBusiness(businessId)
  const updateBusiness = useUpdateBusiness(businessId)
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', slotDuration: 60, timezone: TIMEZONES[0]!.value })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name,
        address: business.address ?? '',
        phone: business.phone ?? '',
        email: business.email ?? '',
        slotDuration: business.slotDuration,
        timezone: business.timezone,
      })
    }
  }, [business])

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    updateBusiness.mutate(form, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2200) },
    })
  }

  if (isLoading) return <p className="text-body-sm text-ink-400">Cargando…</p>

  return (
    <div style={{ maxWidth: 580 }}>
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 14px', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>Datos del complejo</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={cfgLbl}>Nombre del complejo *</label>
            <input style={cfgFld} value={form.name} onChange={(e) => upd('name', e.target.value)} aria-label="Nombre del complejo" />
          </div>
          <div>
            <label style={cfgLbl}>Dirección</label>
            <input style={cfgFld} value={form.address} onChange={(e) => upd('address', e.target.value)} aria-label="Dirección" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={cfgLbl}>Teléfono</label>
              <input type="tel" style={cfgFld} value={form.phone} onChange={(e) => upd('phone', e.target.value)} aria-label="Teléfono" />
            </div>
            <div>
              <label style={cfgLbl}>Email</label>
              <input type="email" style={cfgFld} value={form.email} onChange={(e) => upd('email', e.target.value)} aria-label="Email" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-strong)', margin: '0 0 14px', paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>Configuración de turnos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={cfgLbl}>Duración base del turno</label>
            <select style={cfgFld} value={form.slotDuration} onChange={(e) => upd('slotDuration', Number(e.target.value))}>
              {[30, 60, 90, 120].map((d) => <option key={d} value={d}>{d} minutos</option>)}
            </select>
            <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>Bloque mínimo de reserva.</p>
          </div>
          <div>
            <label style={cfgLbl}>Zona horaria</label>
            <select style={cfgFld} value={form.timezone} onChange={(e) => upd('timezone', e.target.value)}>
              {TIMEZONES.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button onClick={save} disabled={updateBusiness.isPending || !form.name.trim()}>
          {updateBusiness.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {saved && (
          <span style={{ fontSize: 13, color: 'var(--green-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle size={15} color="var(--green-600)" aria-hidden /> Guardado
          </span>
        )}
        {updateBusiness.isError && (
          <span style={{ fontSize: 13, color: '#B91C1C' }}>{getApiErrorMessage(updateBusiness.error)}</span>
        )}
      </div>
    </div>
  )
}

// ── Tab 2: Schedule rules ──────────────────────────────────────────
interface RuleGroup { key: string; ruleIds: string[]; days: number[]; from: string; to: string }

function groupRules(rules: AvailabilityRule[]): RuleGroup[] {
  const map = new Map<string, RuleGroup>()
  for (const r of rules) {
    const key = `${r.startTime.slice(0, 5)}-${r.endTime.slice(0, 5)}`
    const existing = map.get(key)
    if (existing) {
      existing.ruleIds.push(r.id)
      existing.days.push(r.dayOfWeek)
    } else {
      map.set(key, { key, ruleIds: [r.id], days: [r.dayOfWeek], from: r.startTime.slice(0, 5), to: r.endTime.slice(0, 5) })
    }
  }
  return [...map.values()]
}

function SchedulePreview({ groups }: { groups: RuleGroup[] }) {
  const openAt = (day: number, h: number) =>
    groups.some((g) => g.days.includes(day) && h >= parseInt(g.from) && h < parseInt(g.to))

  return (
    <div style={{ marginTop: 24, padding: 16, background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginTop: 0, marginBottom: 12 }}>Vista previa — semana tipo</p>
      <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(7,1fr)', gap: 2 }}>
        <div />
        {CFG_DAYS.map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', paddingBottom: 4 }}>{d.slice(0, 3)}</div>
        ))}
        {Array.from({ length: 24 }, (_, h) => (
          <>
            <div key={`h${h}`} style={{ fontSize: 9, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', textAlign: 'right', paddingRight: 3, lineHeight: '14px' }}>
              {h % 4 === 0 ? `${String(h).padStart(2, '0')}` : ''}
            </div>
            {Array.from({ length: 7 }, (_, d) => (
              <div key={`${h}-${d}`} style={{ height: 14, borderRadius: 2, background: openAt(d, h) ? 'var(--green-200)' : 'var(--surface-sunken)', border: `1px solid ${openAt(d, h) ? 'var(--green-300)' : 'var(--border-subtle)'}` }} />
            ))}
          </>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
        {[['var(--green-200)', 'var(--green-300)', 'Abierto'], ['var(--surface-sunken)', 'var(--border-subtle)', 'Cerrado']].map(([bg, bd, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 8, borderRadius: 2, background: bg, border: `1px solid ${bd}`, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScheduleTab({ businessId }: { businessId: string }) {
  const { data: rules, isLoading, isError } = useAvailabilityRules(businessId)
  const { data: courts } = useCourts(businessId)
  const createRules = useCreateAvailabilityRulesBatch(businessId)
  const deleteRule = useDeleteAvailabilityRule(businessId)

  const groups = useMemo(() => groupRules(rules ?? []), [rules])
  const allCourtIds = useMemo(() => (courts ?? []).map((c) => c.id), [courts])

  const [adding, setAdding] = useState(false)
  const [newDays, setNewDays] = useState<number[]>([])
  const [from, setFrom] = useState('08:00')
  const [to, setTo] = useState('23:00')

  const toggleDay = (d: number) => setNewDays((ds) => (ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]))
  const sFld: React.CSSProperties = { padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-default)', background: 'var(--surface-card)', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-strong)', cursor: 'pointer', outline: 'none' }

  const handleAdd = () => {
    createRules
      .mutateAsync({
        name: 'Horario de atención',
        daysOfWeek: newDays,
        startTime: from,
        endTime: to,
        courtIds: allCourtIds,
      })
      .then(() => { setAdding(false); setNewDays([]) })
  }

  const handleDeleteGroup = (group: RuleGroup) => {
    Promise.all(group.ruleIds.map((id) => deleteRule.mutateAsync(id)))
  }

  if (isLoading) return <p className="text-body-sm text-ink-400">Cargando…</p>
  if (isError) return <p className="text-body-sm text-red-600">No pudimos cargar los horarios.</p>

  return (
    <div style={{ maxWidth: 680 }}>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0, marginBottom: 20 }}>
        Definí los días y horarios en los que el complejo acepta reservas. Se aplican a todas las canchas.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {groups.map((g) => {
          const dayNames = [...g.days].sort().map((d) => CFG_DAYS[d]?.slice(0, 3) ?? '').join(', ')
          return (
            <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--surface-brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={17} color="var(--green-700)" aria-hidden />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)' }}>{dayNames}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{g.from} – {g.to} · Todas las canchas</div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteGroup(g)}
                aria-label="Eliminar regla"
                style={{ padding: '5px 8px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', display: 'flex', color: 'var(--danger)' }}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          )
        })}
        {groups.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Todavía no configuraste horarios de atención.</p>
        )}
      </div>

      {adding ? (
        <div style={{ padding: 18, background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--action-primary)', boxShadow: 'var(--shadow-md)', marginBottom: 10 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', margin: '0 0 14px' }}>Nueva regla</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Días</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {CFG_DAYS.map((d, i) => {
              const on = newDays.includes(i)
              return (
                <button key={i} type="button" onClick={() => toggleDay(i)} style={{ padding: '6px 12px', borderRadius: 'var(--r-full)', border: `1.5px solid ${on ? 'var(--action-primary)' : 'var(--border-default)'}`, background: on ? 'var(--action-primary)' : 'transparent', color: on ? 'white' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {d.slice(0, 3)}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'end', marginBottom: 16 }}>
            <div>
              <label style={{ ...cfgLbl, marginBottom: 4 }}>Desde</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} style={sFld}>
                {CFG_HOURS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <span style={{ marginTop: 18, color: 'var(--text-subtle)', textAlign: 'center' }}>→</span>
            <div>
              <label style={{ ...cfgLbl, marginBottom: 4 }}>Hasta</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} style={sFld}>
                {CFG_HOURS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setAdding(false)} style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>Cancelar</button>
            <button
              type="button"
              disabled={newDays.length === 0 || createRules.isPending}
              onClick={handleAdd}
              style={{ padding: '8px 18px', borderRadius: 'var(--r-md)', border: 'none', background: newDays.length > 0 ? 'var(--action-primary)' : 'var(--ink-200)', color: 'white', cursor: newDays.length > 0 ? 'pointer' : 'default', fontSize: 13, fontWeight: 700 }}
            >
              {createRules.isPending ? 'Guardando…' : 'Guardar regla'}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', width: '100%', border: '1.5px dashed var(--border-default)', borderRadius: 'var(--r-md)', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
          <Plus size={16} aria-hidden /> Agregar regla de horario
        </button>
      )}

      <SchedulePreview groups={groups} />
    </div>
  )
}

// ── Tab 3: Exceptions ──────────────────────────────────────────────
const EX_TYPES = {
  closed: { label: 'Día cerrado', bg: 'rgba(220,38,38,.08)', fg: '#B91C1C', bd: 'rgba(220,38,38,.2)' },
  special: { label: 'Horario especial', bg: 'var(--amber-50)', fg: 'var(--amber-700)', bd: 'var(--amber-100)' },
  blocked: { label: 'Bloqueo de horario', bg: 'var(--state-blocked-bg)', fg: 'var(--state-blocked-fg)', bd: 'var(--state-blocked-bd)' },
} as const

type ExType = keyof typeof EX_TYPES

function classify(ex: ExceptionRule): ExType {
  if (ex.isAvailable) return 'special'
  return ex.startTime && ex.endTime ? 'blocked' : 'closed'
}

const EX_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

function ExceptionsTab({ businessId }: { businessId: string }) {
  const { data: exceptions, isLoading, isError } = useExceptionRules(businessId)
  const { data: courts } = useCourts(businessId)
  const createException = useCreateExceptionRule(businessId)
  const deleteException = useDeleteExceptionRule(businessId)

  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [adding, setAdding] = useState(false)
  const [newEx, setNewEx] = useState({ date: '', type: 'closed' as ExType, note: '', from: '08:00', to: '23:00', courtIds: [] as string[] })

  const list = exceptions ?? []
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMon = new Date(year, month + 1, 0).getDate()
  const offset = (firstDow + 6) % 7
  const exMap: Record<number, ExceptionRule> = {}
  list.forEach((e) => {
    const [y, m, d] = e.date.split('-').map(Number) as [number, number, number]
    if (m! - 1 === month && y === year) exMap[d!] = e
  })

  const handleAdd = () => {
    createException.mutate(
      {
        date: newEx.date,
        isAvailable: newEx.type === 'special',
        ...(newEx.note ? { reason: newEx.note } : {}),
        ...(newEx.type !== 'closed' ? { startTime: newEx.from, endTime: newEx.to } : {}),
        ...(newEx.type === 'blocked' && newEx.courtIds.length > 0 ? { courtIds: newEx.courtIds } : {}),
      },
      { onSuccess: () => { setAdding(false); setNewEx({ date: '', type: 'closed', note: '', from: '08:00', to: '23:00', courtIds: [] }) } },
    )
  }

  if (isLoading) return <p className="text-body-sm text-ink-400">Cargando…</p>
  if (isError) return <p className="text-body-sm text-red-600">No pudimos cargar las excepciones.</p>

  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      {/* Mini calendar */}
      <div style={{ flexShrink: 0, width: 320 }}>
        <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px 10px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button type="button" onClick={() => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }} aria-label="Mes anterior">◀</button>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-strong)' }}>{EX_MONTHS[month]} {year}</span>
            <button type="button" onClick={() => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }} aria-label="Mes siguiente">▶</button>
          </div>
          <div style={{ padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', padding: '3px 0' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMon }, (_, i) => {
                const day = i + 1
                const ex = exMap[day]
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const et = ex ? EX_TYPES[classify(ex)] : null
                return (
                  <div key={day} title={ex?.reason ?? undefined} style={{ aspectRatio: '1', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 12, fontWeight: isToday || ex ? 700 : 400, background: et ? et.bg : isToday ? 'var(--action-primary)' : 'transparent', color: et ? et.fg : isToday ? 'white' : 'var(--text-body)', border: et ? `1px solid ${et.bd}` : '1px solid transparent' }}>
                    {day}
                    {ex && <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: et?.fg, display: 'block' }} />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(Object.entries(EX_TYPES) as [ExType, typeof EX_TYPES[ExType]][]).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, background: v.bg, border: `1px solid ${v.bd}`, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exception list + form */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-strong)' }}>Excepciones</h3>
          <Button size="sm" leftIcon={<Plus size={14} aria-hidden />} onClick={() => setAdding(true)}>Agregar excepción</Button>
        </div>

        {adding && (
          <div style={{ padding: 16, marginBottom: 12, background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--action-primary)' }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-strong)', marginTop: 0, marginBottom: 12 }}>Nueva excepción</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={cfgLbl}>Fecha</label>
                <input type="date" value={newEx.date} onChange={(e) => setNewEx((x) => ({ ...x, date: e.target.value }))} style={{ ...cfgFld }} aria-label="Fecha de excepción" />
              </div>
              <div>
                <label style={cfgLbl}>Tipo</label>
                <select value={newEx.type} onChange={(e) => setNewEx((x) => ({ ...x, type: e.target.value as ExType }))} style={{ ...cfgFld }}>
                  {(Object.entries(EX_TYPES) as [ExType, typeof EX_TYPES[ExType]][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            {newEx.type !== 'closed' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={cfgLbl}>Desde</label>
                  <select value={newEx.from} onChange={(e) => setNewEx((x) => ({ ...x, from: e.target.value }))} style={{ ...cfgFld }}>
                    {CFG_HOURS.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label style={cfgLbl}>Hasta</label>
                  <select value={newEx.to} onChange={(e) => setNewEx((x) => ({ ...x, to: e.target.value }))} style={{ ...cfgFld }}>
                    {CFG_HOURS.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            )}
            {newEx.type === 'blocked' && (
              <div style={{ marginBottom: 12 }}>
                <label style={cfgLbl}>Canchas afectadas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(courts ?? []).map((c) => {
                    const on = newEx.courtIds.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewEx((x) => ({
                          ...x,
                          courtIds: on ? x.courtIds.filter((id) => id !== c.id) : [...x.courtIds, c.id],
                        }))}
                        style={{ padding: '6px 12px', borderRadius: 'var(--r-full)', border: `1.5px solid ${on ? 'var(--action-primary)' : 'var(--border-default)'}`, background: on ? 'var(--action-primary)' : 'transparent', color: on ? 'white' : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        {c.name}
                      </button>
                    )
                  })}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 5 }}>
                  Si no seleccionás ninguna, el bloqueo aplica a todas las canchas.
                </p>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={cfgLbl}>Nota / motivo</label>
              <input value={newEx.note} onChange={(e) => setNewEx((x) => ({ ...x, note: e.target.value }))} placeholder="Ej: Feriado nacional, torneo especial, mantenimiento…" style={{ ...cfgFld }} aria-label="Nota" />
            </div>
            {createException.isError && (
              <p style={{ fontSize: 12, color: '#B91C1C', marginBottom: 10 }}>{getApiErrorMessage(createException.error)}</p>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setAdding(false)} style={{ padding: '7px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)' }}>Cancelar</button>
              <button
                type="button"
                disabled={!newEx.date || createException.isPending}
                onClick={handleAdd}
                style={{ padding: '7px 14px', borderRadius: 'var(--r-md)', border: 'none', background: newEx.date ? 'var(--action-primary)' : 'var(--ink-200)', color: 'white', cursor: newEx.date ? 'pointer' : 'default', fontSize: 12, fontWeight: 700 }}
              >
                {createException.isPending ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', background: 'var(--surface-sunken)', borderRadius: 'var(--r-lg)', border: '1px dashed var(--border-default)', color: 'var(--text-subtle)' }}>
            <CalendarOff size={28} color="var(--ink-300)" aria-hidden />
            <p style={{ margin: '8px 0 0', fontSize: 13 }}>No hay excepciones definidas</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...list].sort((a, b) => a.date.localeCompare(b.date)).map((ex) => {
              const et = EX_TYPES[classify(ex)]
              let dateStr = ex.date
              try { dateStr = new Date(ex.date + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }) } catch { /* keep raw */ }
              return (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface-card)', borderRadius: 'var(--r-lg)', border: `1px solid ${et.bd}` }}>
                  <div style={{ width: 6, height: 36, borderRadius: 3, background: et.fg, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-strong)', textTransform: 'capitalize' }}>{dateStr}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                      {ex.reason || '—'}{ex.startTime && ex.endTime ? ` · ${ex.startTime.slice(0, 5)}–${ex.endTime.slice(0, 5)}` : ''}
                      {ex.courts && ex.courts.length > 0 ? ` · ${ex.courts.map((c) => c.name).join(', ')}` : ''}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: et.fg, background: et.bg, padding: '2px 9px', borderRadius: 'var(--r-full)', border: `1px solid ${et.bd}`, flexShrink: 0 }}>{et.label}</span>
                  <button type="button" onClick={() => deleteException.mutate(ex.id)} aria-label={`Eliminar excepción ${ex.reason ?? ex.date}`} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-subtle)', padding: 4 }}>
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab 4: Billing ─────────────────────────────────────────────────
// Full billing UI lives in features/billing/components/BillingSettingsPanel.
function BillingTab({ businessId }: { businessId: string }) {
  const navigate = useNavigate()

  return (
    <BillingSettingsPanel
      businessId={businessId}
      onUpgrade={() => navigate(`/admin/${businessId}/upgrade`)}
    />
  )
}

// ── Main page ──────────────────────────────────────────────────────
const TABS = [
  { key: 'general',     label: 'Datos generales', Icon: Building2   },
  { key: 'horarios',    label: 'Horarios',         Icon: Clock       },
  { key: 'excepciones', label: 'Excepciones',      Icon: CalendarOff },
  { key: 'facturacion', label: 'Facturación',      Icon: CreditCard  },
] as const

export default function AdminSettingsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { data: business } = useBusiness(businessId)
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('general')

  if (!businessId) return null

  return (
    <AdminShell title="Configuración" subtitle={business?.name ?? ''}>
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-none flex border-b border-ink-100 bg-white px-7">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-transparent border-none transition-colors',
                activeTab === key
                  ? 'border-green-500 text-green-700'
                  : 'border-transparent text-ink-500 hover:text-ink-800',
              )}
            >
              <Icon size={15} aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-7">
          {activeTab === 'general'     && <GeneralTab businessId={businessId} />}
          {activeTab === 'horarios'    && <ScheduleTab businessId={businessId} />}
          {activeTab === 'excepciones' && <ExceptionsTab businessId={businessId} />}
          {activeTab === 'facturacion' && <BillingTab businessId={businessId} />}
        </div>
      </div>
    </AdminShell>
  )
}
