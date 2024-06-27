import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface ICompanyCarStatus extends IBaseObject {
  /**
   * id of the company car status
   */
  id: number
  /**
   * name of the company car status
   */
  name: string
  /**
   * if this is the default status for a driving company car
   */
  driving_default: number
  /**
   * if this is the default status for a idling company car
   */
  idle_default: number
  created_at: string
  updated_at: string
}
