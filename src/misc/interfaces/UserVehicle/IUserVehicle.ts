import IUser from 'src/misc/interfaces/User/IUser'
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'
import IUserVehicleTuning from 'src/misc/interfaces/UserVehicle/IUserVehicleTuning'
import IUserVehicleRemoval from 'src/misc/interfaces/UserVehicle/IUserVehicleRemoval'
import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUserVehicleColor from 'src/misc/interfaces/UserVehicle/IUserVehicleColor'

export default interface IUserVehicle extends IBaseObject {
  id: number
  user_id?: number
  user?: IUser
  vehicle_id: number
  vehicle?: IVehicle
  license_plate?: string | null
  miles?: number | null
  winter_tires?: boolean | number
  inspection_date?: string | null
  parking_location?: string | null
  purchase_price?: number | null
  purchase_date?: string | null
  tuning?: IUserVehicleTuning | null
  removal?: IUserVehicleRemoval | null
  colors?: IUserVehicleColor[] | null
  created_at?: string
  updated_at?: string
}
