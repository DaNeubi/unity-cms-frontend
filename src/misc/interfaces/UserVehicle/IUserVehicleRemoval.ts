import IUserVehicle from 'src/misc/interfaces/UserVehicle/IUserVehicle'

export default interface IUserVehicleRemoval {
  id: number
  user_vehicle_id: number
  userVehicle?: IUserVehicle
  reason?: string | null
}
