import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'

export default interface IDriveLogBook extends IBaseObject {
  id: number
  /**
   * where the pickup is
   */
  start_location?: string
  /**
   * where the passenger is going
   */
  end_location?: string
  /**
   * when the passenger is picked up
   */
  pick_up_time?: string | null
  /**
   * how many passengers are in the car
   */
  passenger_count?: number
  /**
   * the number that the passenger can be reached at
   */
  phone_number?: string
  /**
   * the id of the company car
   */
  company_car_id?: number | null
  /**
   * the company car
   */
  company_car?: ICompanyCar | null
  /**
   * id of the company
   */
  company_id?: number
  /**
   * when the passenger is dropped off
   */
  done?: boolean
  /**
   * if the ride is cancelled
   */
  cancelled?: boolean
  /**
   * when the ride is cancelled
   */
  deleted_at?: string
  /**
   * when the ride was created
   */
  created_at?: string
  /**
   * when the ride was last updated/done if done is true
   */
  updated_at?: string
}
