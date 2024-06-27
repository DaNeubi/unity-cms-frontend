import IUser from 'src/misc/interfaces/User/IUser'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'

export default interface ICompanyCarDriver {
  id: number
  company_car_id: number
  companyCar?: ICompanyCar
  user_id: number
  user?: IUser
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}
