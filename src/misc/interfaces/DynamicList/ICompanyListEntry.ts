import IUser from 'src/misc/interfaces/User/IUser'
import ICompanyList from 'src/misc/interfaces/DynamicList/ICompanyList'

export default interface ICompanyListEntry {
  /**
   * The ID of the company list entry.
   */
  id: number
  /**
   * id of the company list this entry belongs to
   */
  company_list_id: number
  /**
   * company list this entry belongs to
   */
  company_list?: ICompanyList
  /**
   * id of the user that created this entry
   */
  user_id: number
  /**
   * user that created this entry
   */
  user?: IUser
  deleted_at?: string | null
  created_at: string
  updated_at: string
}
