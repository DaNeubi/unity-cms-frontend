import IBaseObject from '../IBaseObject'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'
import IRace from 'src/misc/interfaces/Race/IRace'
import IRaceVehicleLap from 'src/misc/interfaces/Race/IRaceVehicleLap'
import IRaceVehiclePitstop from 'src/misc/interfaces/Race/IRaceVehiclePitstop'

export default interface IRaceVehicle extends IBaseObject {
  /**
   * id of the race vehicle
   */
  id: number
  /**
   * markant details of the vehicle
   */
  details: string
  /**
   * if the vehicle is a safety car
   */
  safety_car: boolean|number
  /**
   * id of the company car
   */
  company_car_id: number
  /**
   * company car
   */
  company_car?: ICompanyCar
  /**
   * race participant id
   */
  race_participant_id?: number
  /**
   * race participant
   */
  race_participant?: IRaceParticipant
  /**
   * race id
   */
  race_id: number
  /**
   * race
   */
  race?: IRace
  /**
   * all the laps of the race vehicle
   */
  laps?: IRaceVehicleLap[]
  /**
   * list of all pitstops
   */
  pitStops?: IRaceVehiclePitstop[]
}
