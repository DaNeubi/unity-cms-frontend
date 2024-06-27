import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompany from 'src/misc/interfaces/Company/ICompany'

export default interface ICompanySantosPointsSettings extends IBaseObject {
  id: number
  company_id: number
  company?: ICompany
  enabled: boolean
  multiplier: number
  customizable_items: boolean
  created_at: string
  updated_at: string
}
