import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface ISimpleCalendarEvent extends IBaseObject {
  /**
   * id of the event
   */
  id: number
  /**
   * title of the event
   */
  title: string
  /**
   * date of the event
   */
  startDate: Date | string
  /**
   * end date of the event
   */
  endDate: Date | string
  /**
   * tooltip of the event
   */
  tooltip?: string
  /**
   * text color of the event
   */
  textColor?: string
  /**
   * background color of the event
   */
  bgColor?: string
  created_at?: string
  updated_at?: string
}
