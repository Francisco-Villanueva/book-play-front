import { FileText } from 'lucide-react'
import type { Payment } from '../api/billingApi'

interface InvoiceHistoryTableProps {
  payments: Payment[]
}

const STATUS_LABEL: Record<Payment['status'], string> = {
  APPROVED: 'Pagado',
  PENDING: 'Pendiente',
  REJECTED: 'Fallido',
  REFUNDED: 'Reembolsado',
}

const STATUS_CLASS: Record<Payment['status'], string> = {
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-ink-50 text-ink-500 border-ink-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
  REFUNDED: 'bg-ink-50 text-ink-500 border-ink-200',
}

export function InvoiceHistoryTable({ payments }: InvoiceHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
        <p className="text-overline text-ink-400 m-0 px-[22px] py-3.5 border-b border-ink-100">Historial de pagos</p>
        <p className="text-caption text-ink-400 px-[22px] py-6 text-center m-0">Todavía no hay pagos registrados.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-ink-100 overflow-hidden">
      <p className="text-overline text-ink-400 m-0 px-[22px] py-3.5 border-b border-ink-100">Historial de pagos</p>
      {payments.map((payment, i) => (
        <div
          key={payment.id}
          className={`flex items-center justify-between px-[22px] py-3 ${i ? 'border-t border-ink-100' : ''}`}
        >
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-ink-400" aria-hidden />
            <div>
              <div className="text-caption font-semibold text-ink-700">
                {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('es-AR') : 'Sin fecha'}
              </div>
              <div className="text-[11px] text-ink-400 font-mono">{payment.id}</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="font-mono font-bold text-body-sm text-ink-900">
              ${Number(payment.amount).toLocaleString('es-AR')}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CLASS[payment.status]}`}>
              {STATUS_LABEL[payment.status]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
