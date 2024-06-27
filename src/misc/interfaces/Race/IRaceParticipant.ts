import IBaseObject from '../IBaseObject'
import IUser from '../User/IUser'
import IPerson from 'src/misc/interfaces/Person/IPerson'
import IRace from './IRace'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'

export default interface IRaceParticipant extends IBaseObject {
  /**
   * id of the race participant
   */
  id: number
  /**
   * if the participant is disqualified
   */
  disqualified: boolean|number
  /**
   * if the participant is finished
   */
  finished: boolean|number
  /**
   * current lap of the participant
   */
  lap: number
  /**
   * id of the user if the participant is a user
   */
  user_id?: number
  /**
   * user if the participant is a user
   */
  user?: IUser
  /**
   * id of the person if the participant is a person
   */
  person_id?: number
  /**
   * person if the participant is a person
   */
  person?: IPerson
  /**
   * id of the race the participant is in
   */
  race_id: number
  /**
   * race the participant is in
   */
  race?: IRace
  /**
   * the vehicle the participant is using
   */
  vehicle?: IRaceVehicle | null | undefined
  /**
   * local field to determine if the participant is selected for mass start
   */
  selectedForMassStart?: boolean
  created_at?: string
  updated_at?: string
}
