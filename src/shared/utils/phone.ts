import { isValidPhoneNumber } from 'react-phone-number-input'

export function isValidArgentinePhone(value: string | undefined): boolean {
  if (!value) return false
  return isValidPhoneNumber(value, 'AR')
}
