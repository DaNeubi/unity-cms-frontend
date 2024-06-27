import ICompany from 'src/misc/interfaces/Company/ICompany'

export default interface ICompanyList {
  /**
   * id of the company list
   */
  id: number
  /**
   * name of the company list
   */
  name: string
  /**
   * id of the company
   */
  company_id: number
  /**
   * company
   */
  company?: ICompany
  deleted_at?: string | null
  created_at: string
  updated_at: string
}
