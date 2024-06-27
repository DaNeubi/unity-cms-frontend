import ICompany from 'src/misc/interfaces/Company/ICompany'
import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from 'src/misc/interfaces/User/IUser'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'

export default interface IRace extends IBaseObject {
  /**
   * id of the race
   */
  id: number
  /**
   * date of the race
   */
  date: string
  /**
   * name of the race
   */
  name: string
  /**
   * location of the race
   */
  location: string
  /**
   * if the race will be displayed to the public page
   */
  public: boolean | number
  /**
   * max laps amount
   */
  laps: number
  /**
   * max participants amount
   */
  participants: number
  /**
   * company id of the race
   */
  company_id: number
  /**
   * company of the race
   */
  company?: ICompany
  /**
   * user id that created the race
   */
  user_id: number
  /**
   * user that created the race
   */
  user?: IUser
  /**
   * all included race vehicles
   */
  race_vehicles?: IRaceVehicle[]
  race_participants?: IRaceParticipant[]
  created_at: string
  updated_at: string
}
