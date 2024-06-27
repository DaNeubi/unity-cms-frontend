import ICompanyListEntry from 'src/misc/interfaces/DynamicList/ICompanyListEntry'
import ICompanyListItemField from 'src/misc/interfaces/DynamicList/ICompanyListItemField'

export default interface ICompanyListItem {
  /**
   * The ID of the company list item.
   */
  id: number
  /**
   * The value of the company list item.
   */
  value: string
  /**
   * The ID of the company list entry.
   */
  company_list_entry_id: number
  /**
   * The company list entry.
   */
  company_list_entry?: ICompanyListEntry
  /**
   * The ID of the company list item field.
   */
  company_list_item_field_id: number
  /**
   * The company list item field.
   */
  company_list_item_field?: ICompanyListItemField
  deleted_at?: string | null
  created_at: string
  updated_at: string
}
