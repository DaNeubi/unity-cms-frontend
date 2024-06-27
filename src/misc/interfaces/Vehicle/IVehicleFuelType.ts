import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IVehicleFuelType extends IBaseObject {
  /**
   * Vehicle fuel type id
   */
  id: number
  /**
   * Vehicle fuel type name
   */
  name: string
  /**
   * when the vehicle fuel type was created
   */
  created_at: string
  /**
   * when the vehicle fuel type was updated
   */
  updated_at: string
}
