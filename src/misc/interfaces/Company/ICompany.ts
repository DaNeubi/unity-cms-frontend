import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompanyModuleAccess from './ICompanyModuleAccess'
import ICompanyOwner from './ICompanyOwner'
import ICompanySantosPointsSettings from 'src/misc/interfaces/Company/IcompanySantosPointsSettings'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface ICompany extends IBaseObject {
  id: number
  name: string
  logo: string
  bank_account_number: string
  phone_number: string
  created_at: string
  updated_at: string
  user_limit: number
  owners?: ICompanyOwner[]
  users?: IUser[]
  radio_limit?: number
  company_module_accesses?: ICompanyModuleAccess
  company_santos_point_setting?: ICompanySantosPointsSettings
  company_settings?: ICompanySetting
}
