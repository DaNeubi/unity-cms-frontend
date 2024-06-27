export default interface ICalendarEvent {
  /**
   * id of the event
   */
  id: number
  /**
   * title of the event
   */
  title: string
  /**
   * location of the event
   */
  location: string
  /**
   * details to the event
   */
  details?: string | null
  /**
   * alternative field for the details
   */
  tooltip?: string | null
  /**
   * shortDetails to the event
   */
  shortDetails?: string | null
  /**
   * if the short details will be used as details
   */
  shortDetailsDetails: boolean
  /**
   * date/startDate of the event
   */
  date: string
  /**
   * for Serialization between the ICalendarEvent and the ISimpleCalendarEvent
   */
  startDate?: string
  /**
   * for Serialization between the ICalendarEvent and the ISimpleCalendarEvent
   */
  endDate?: string
  /**
   * background Color of the event
   */
  bgColor: string | null
  /**
   * text Color of the event
   */
  textColor: string | null
  /**
   * duration of the event
   */
  duration: number | null
  /**
   * created_at of the event
   */
  created_at?: string
  /**
   * updated_at of the event
   */
  updated_at?: string
}
