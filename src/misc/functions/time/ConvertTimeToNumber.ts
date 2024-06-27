export default function ConvertTimeToNumber (timeToCalc: string | number): number {
  const timeArray = timeToCalc.toString().split(':')
  const totalSeconds = parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60 + parseInt(timeArray[2])
  const days = Math.floor(totalSeconds / 86400)
  return Math.round(days)
}
