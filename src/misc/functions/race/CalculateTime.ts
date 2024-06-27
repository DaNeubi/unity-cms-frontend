import { date } from 'quasar'

/**
 * Returns a formatted string for a given lap duration.
 * Usage for the RaceLocker
 * @param milliseconds
 * @constructor
 */
export default function GetDurationFromMilliseconds (milliseconds: number): string {
  if (milliseconds === undefined) return '00:00:00.000'
  const currDate = new Date()
  currDate.setHours(0)
  currDate.setMinutes(0)
  currDate.setSeconds(0)
  currDate.setMilliseconds(milliseconds)
  return date.formatDate(currDate, 'HH:mm:ss.SSS')
}
