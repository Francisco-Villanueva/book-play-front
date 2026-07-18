import { Check } from 'lucide-react'
import { STEP_LABELS, STEP_NUMBER, type PublicStep } from '../types'

// Mobile: 4-segment bar with labels underneath.
export function StepProgressBar({ step }: { step: PublicStep }) {
  const num = STEP_NUMBER[step]
  return (
    <div className="flex-none px-4 pt-2 pb-1.5 bg-white border-b border-ink-100">
      <div className="flex gap-1 mb-1.5">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className="flex-1 h-[3px] rounded-full"
            style={{ background: i < num ? 'var(--action-primary)' : 'var(--border-default)' }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {STEP_LABELS.map((label, i) => (
          <span
            key={label}
            className="text-[10px] font-body"
            style={{
              fontWeight: i < num ? 700 : 500,
              color: i < num ? 'var(--green-600)' : 'var(--text-subtle)',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// Desktop: horizontal wizard with numbered circles.
export function StepWizard({ step }: { step: PublicStep }) {
  const num = STEP_NUMBER[step]
  return (
    <div className="flex items-center">
      {STEP_LABELS.map((label, i) => {
        const done = i + 1 < num
        const active = i + 1 === num
        return (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div
                className="w-8 h-px mx-1"
                style={{ background: done ? 'var(--action-primary)' : 'var(--border-default)' }}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex-none flex items-center justify-center text-[11px] font-bold border-2"
                style={{
                  background: done ? 'var(--action-primary)' : active ? 'var(--green-50)' : 'transparent',
                  borderColor: done || active ? 'var(--action-primary)' : 'var(--border-default)',
                  color: done ? '#fff' : active ? 'var(--action-primary)' : 'var(--text-subtle)',
                }}
              >
                {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className="text-[13px] font-body"
                style={{
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--text-strong)' : done ? 'var(--action-primary)' : 'var(--text-subtle)',
                }}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
