import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

// El shell se elige por ancho de viewport y no por dispositivo: una ventana
// angosta de escritorio tiene que comportarse igual que un celular.
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)')
}
