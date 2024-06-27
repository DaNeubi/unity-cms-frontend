import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IRaceVehicle from './IRaceVehicle'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IRaceVehicleLap extends IBaseObject {
  /**
   * id of the race vehicle lap
   */
  id: number
  /**
   * lap number
   */
  lap: number
  /**
   * duration of the lap
   */
  duration: number
  /**
   * id of the race vehicle
   */
  race_vehicle_id: number
  /**
   * race vehicle
   */
  race_vehicle: IRaceVehicle
  /**
   * user that stopped that lap
   */
  user?: IUser | null
}
