import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IVehicleManufacturer extends IBaseObject {
  /**
   * Vehicle manufacturer id
   */
  id: number
  /**
   * Vehicle manufacturer name
   */
  name: string
  /**
   * when the vehicle manufacturer was created
   */
  created_at?: string
  /**
   * when the vehicle manufacturer was updated
   */
  updated_at?: string
}
