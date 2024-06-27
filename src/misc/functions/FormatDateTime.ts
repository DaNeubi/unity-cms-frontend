import { date } from 'quasar'
import formatDate = date.formatDate

export default function FormatDateTime (date: Date | string | undefined | null, withOutTime?: boolean) {
  if (date === undefined || date === null) {
    return ''
  }
  const d = Date.parse(date.toString())
  if (withOutTime) {
    return formatDate(d, 'DD.MM.YYYY')
  }
  return formatDate(d, 'DD.MM.YYYY HH:mm:ss')
}
