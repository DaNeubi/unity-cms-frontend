import IBaseObject from '../IBaseObject'
import IVehicle from '../Vehicle/IVehicle'

export default interface ICompanyCarVehicle extends IBaseObject {
  company_car_id: number
  vehicle_id: number
  vehicle?: IVehicle
}
