import IUserVehicle from 'src/misc/interfaces/UserVehicle/IUserVehicle'

export default interface IUserVehicleTuning {
  id: number
  user_vehicle_id: number
  userVehicle?: IUserVehicle
  engine_tuning: number
  transmission_tuning: number
  turbo_tuning: number
  brake_tuning: number
}
