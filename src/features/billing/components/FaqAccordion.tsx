interface FaqItem {
  question: string
  answer: string
}

const DEFAULT_FAQ: FaqItem[] = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí. El cambio se aplica inmediatamente y Stripe prorratea el costo.',
  },
  {
    question: '¿Qué pasa con mis datos si suscribo el trial?',
    answer: 'Todos tus datos (canchas, reservas, configuración) se conservan intactos.',
  },
  {
    question: '¿Necesito tarjeta para el trial?',
    answer: 'No. El plan Gratis no requiere método de pago para activarse.',
  },
  {
    question: '¿Cómo cancelo?',
    answer: 'Desde la sección Facturación en Configuración. Mantenés el acceso hasta fin del período pago.',
  },
]

interface FaqAccordionProps {
  items?: FaqItem[]
}

export function FaqAccordion({ items = DEFAULT_FAQ }: FaqAccordionProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <details key={item.question} className="bg-white rounded-lg border border-ink-100 overflow-hidden group">
          <summary className="px-[18px] py-3.5 cursor-pointer text-body-sm font-bold text-ink-900 list-none marker:content-none">
            {item.question}
          </summary>
          <p className="m-0 px-[18px] pb-3.5 text-caption text-ink-500 leading-relaxed">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
