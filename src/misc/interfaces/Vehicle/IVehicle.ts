import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IVehicleManufacturer from 'src/misc/interfaces/Vehicle/IVehicleManufacturer'
import IVehicleCategory from 'src/misc/interfaces/Vehicle/IVehicleCategory'
import IVehicleFuelType from 'src/misc/interfaces/Vehicle/IVehicleFuelType'

export default interface IVehicle extends IBaseObject {
  /**
   * id of the vehicle
   */
  id: number
  /**
   * name of the vehicle
   */
  name: string
  /**
   * list price of the vehicle
   */
  price: number
  /**
   * manufacturer enum id of the vehicle
   */
  vehicle_manufacturer_id: number | null
  /**
   * manufacturer of the vehicle
   */
  manufacturer?: IVehicleManufacturer | null
  /**
   * seat amount of the vehicle
   */
  seat_amount: number
  /**
   * trunk size of the vehicle
   */
  trunk: number
  /**
   * glove compartment size of the vehicle
   */
  glove_compartment: number
  /**
   * fuel type id of the vehicle
   */
  vehicle_fuel_type_id: number
  /**
   * fuel type of the vehicle
   */
  fuel_type?: IVehicleFuelType | null
  /**
   * fuel size of the vehicle
   */
  fuel_amount: number
  /**
   * category id
   */
  vehicle_category_id: number | null
  /**
   * category of the vehicle
   */
  category?: IVehicleCategory | null
  /**
   * if the vehicle is a soon car
   */
  soon_car: boolean
  /**
   * image if available
   */
  image?: string | null
}
