import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IVehicleCategory extends IBaseObject {
  /**
   * Vehicle category id
   */
  id: number
  /**
   * Vehicle category name
   */
  name: string
  /**
   * when the vehicle category was created
   */
  created_at: string
  /**
   * when the vehicle category was updated
   */
  updated_at: string
}
