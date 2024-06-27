export function GetCurrentStartDate (startDate: string | undefined, timeSpanDays: number, offset = 0): Date | undefined {
  if (startDate === undefined) return undefined
  // get difference in days between current date and startDate
  const currentDate = new Date()
  const differenceInDays = (currentDate.getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)
  // divide differenceInDays by the timeSpanDays given
  const amountOfTimeSpans = differenceInDays / timeSpanDays
  const amountOfTimeSpansRounded = Math.floor(amountOfTimeSpans)
  // add the amountOfTimeSpansRounded to the startDate
  const newStartDate = new Date(startDate)
  newStartDate.setDate(newStartDate.getDate() + (amountOfTimeSpansRounded * timeSpanDays))
  // now add the offset of days
  newStartDate.setDate(newStartDate.getDate() - offset)
  // now we have the full days since the startDate
  return newStartDate
}

export function GetCurrentEndDate (startDate: string | undefined, timeSpanDays: number, offset = 0): Date | undefined {
  if (startDate === undefined) return undefined
  const newStartDate = GetCurrentStartDate(startDate, timeSpanDays, offset)
  if (newStartDate === undefined) return undefined
  const newEndDate = new Date(newStartDate)
  newEndDate.setDate(newEndDate.getDate() + timeSpanDays)
  return newEndDate
}
