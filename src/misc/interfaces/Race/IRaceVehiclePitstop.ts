import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'

export default interface IRaceVehiclePitstop extends IBaseObject {
  /**
   * id of the pitstop
   */
  id: number
  /**
   * id of the race vehicle
   */
  race_vehicle_id: number
  /**
   * rave vehicle
   */
  race_vehicle: IRaceVehicle
}
