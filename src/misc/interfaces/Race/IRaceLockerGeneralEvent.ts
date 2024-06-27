import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'
import IRaceVehicleLap from 'src/misc/interfaces/Race/IRaceVehicleLap'

export default interface IRaceLockerGeneralEvent {
  /**
   * id of the company this is for
   */
  company_id: number
  /**
   * main object
   */
  raceLockerGeneralInformation: {
    /**
     * id of the race this belongs to
     */
    race_id: number
    /**
     * the race participant this is about
     */
    intermediateRaceParticipant?: IRaceParticipant | null
    /**
     * the vehicle that was changed
     */
    intermediateRaceVehicle?: IRaceVehicle | null
    /**
     * the lap that was changed
     */
    intermediateRaceVehicleLap?: IRaceVehicleLap | null
    /**
     * the new laps of the participant
     */
    intermediateRaceVehicleLaps?: IRaceVehicleLap[] | null
    /**
     * if the lap was created
     */
    creation: boolean
    /**
     * if the lap was updated
     */
    update: boolean
    /**
     * if the lap was deleted
     */
    delete: boolean
    /**
     * if the race shall be reloaded from the server
     */
    reload: boolean
  }
}
