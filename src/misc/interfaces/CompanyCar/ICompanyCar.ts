import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompanyCarVehicle from 'src/misc/interfaces/CompanyCar/ICompanyCarVehicle'
import IUser from 'src/misc/interfaces/User/IUser'
import ICompanyCarStatus from 'src/misc/interfaces/CompanyCar/ICompanyCarStatus'

export default interface ICompanyCar extends IBaseObject {
  id: number
  vehicle_id: number
  vehicle?: ICompanyCarVehicle
  company_id: number
  deleted: boolean
  miles: number
  winter_tires: boolean
  inspection_date: string | null
  license_plate: string
  driver_persons?: IUser[]
  car_status?: ICompanyCarStatus | null
}
