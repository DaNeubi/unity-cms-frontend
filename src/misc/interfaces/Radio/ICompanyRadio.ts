import ICompany from 'src/misc/interfaces/Company/ICompany'
import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface ICompanyRadio extends IBaseObject {
  /**
   * id of the radio
   */
  id?: number
  /**
   * name of the radio
   */
  name: string
  /**
   * frequency of the radio
   */
  frequency: number
  /**
   * company id of the radio
   */
  company_id: number
  /**
   * company of the radio
   */
  company?: ICompany
  created_at?: string
  updated_at?: string
}
