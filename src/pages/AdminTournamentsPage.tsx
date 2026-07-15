import { useState } from 'react'
import { Trophy, Users, CalendarCheck, ClipboardList, Bell, Check } from 'lucide-react'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { Button } from '@/shared/components/Button'

const FEATURES = [
  { Icon: Trophy,        title: 'Formatos de torneo',      desc: 'Americano, por zonas, eliminación directa. Vos elegís el formato y el sistema arma todo.' },
  { Icon: Users,         title: 'Inscripción de parejas',   desc: 'Los jugadores se anotan solos desde su perfil. Sin planillas, sin WhatsApp.' },
  { Icon: CalendarCheck, title: 'Fixture automático',       desc: 'El sistema distribuye los partidos en las canchas disponibles según tu agenda.' },
  { Icon: ClipboardList, title: 'Carga de resultados',      desc: 'Registrá resultados desde el panel o dejá que los propios jugadores los carguen.' },
]

const TIMELINE = [
  { label: 'Diseño',      done: true,  active: false },
  { label: 'Desarrollo',  done: false, active: true  },
  { label: 'Beta privada',done: false, active: false },
  { label: 'Lanzamiento', done: false, active: false },
]

export default function AdminTournamentsPage() {
  const [notified, setNotified] = useState(false)

  return (
    <AdminShell title="Torneos" subtitle="Próximamente">
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface-page)' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>

          {/* Pádel-only pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 'var(--r-full)', background: 'var(--blue-50)', border: '1.5px solid var(--blue-200)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue-600)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-700)', letterSpacing: '0.04em' }}>
                Exclusivo para complejos con canchas de pádel
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 12px', borderRadius: 'var(--r-full)', background: 'var(--surface-sunken)', border: '1px solid var(--border-default)', marginBottom: 16 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--amber-500)', flexShrink: 0, boxShadow: '0 0 0 3px var(--amber-100)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber-700)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Próximamente</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-strong)', margin: '0 0 12px', lineHeight: 1.15 }}>
              Gestión de torneos de pádel
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
              Organizá torneos en tu complejo sin planillas ni coordinación manual.
              Desde la inscripción hasta el fixture y los resultados, todo en un solo lugar.
            </p>
          </div>

          {/* Feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} style={{ padding: '20px 20px 18px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', marginBottom: 12, background: 'var(--blue-50)', border: '1px solid var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} color="var(--blue-600)" aria-hidden />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 5 }}>{title}</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ padding: '16px 20px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', marginBottom: 32, display: 'flex', alignItems: 'center' }}>
            {TIMELINE.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: i < TIMELINE.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: s.done ? 'var(--action-primary)' : s.active ? 'var(--amber-100)' : 'var(--surface-sunken)',
                    border: `2px solid ${s.done ? 'var(--action-primary)' : s.active ? 'var(--amber-400)' : 'var(--border-default)'}`,
                  }}>
                    {s.done
                      ? <Check size={14} color="white" strokeWidth={3} aria-hidden />
                      : s.active
                      ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-500)', display: 'block' }} />
                      : <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border-default)', display: 'block' }} />
                    }
                  </div>
                  <span style={{ fontSize: 11, fontWeight: s.active ? 700 : 500, whiteSpace: 'nowrap', color: s.done ? 'var(--green-700)' : s.active ? 'var(--amber-700)' : 'var(--text-subtle)' }}>
                    {s.label}
                  </span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div style={{ flex: 1, height: 2, margin: '-14px 6px 0', background: s.done ? 'var(--green-300)' : 'var(--border-default)', borderRadius: 1 }} />
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            textAlign: 'center', padding: '28px 32px',
            background: notified ? 'var(--green-50)' : 'var(--surface-card)',
            border: `1.5px solid ${notified ? 'var(--green-200)' : 'var(--border-default)'}`,
            borderRadius: 'var(--r-xl)',
            transition: 'background .25s, border-color .25s',
          }}>
            {notified ? (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 14px', background: 'var(--action-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={26} color="white" strokeWidth={3} aria-hidden />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>
                  ¡Listo! Te avisamos cuando esté disponible.
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                  Vas a recibir una notificación en tu email cuando la feature de torneos se active para tu complejo.
                </p>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 6 }}>
                  ¿Querés ser de los primeros en usarlo?
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                  Dejanos saber que te interesa y te avisamos cuando salga la beta de torneos para pádel.
                </p>
                <Button size="lg" leftIcon={<Bell size={18} aria-hidden />} onClick={() => setNotified(true)}>
                  Avisame cuando esté disponible
                </Button>
                <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: '10px 0 0' }}>
                  Sin spam. Solo un aviso cuando esté listo.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
