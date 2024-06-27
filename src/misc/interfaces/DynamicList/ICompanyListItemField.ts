import ICompanyList from 'src/misc/interfaces/DynamicList/ICompanyList'

export default interface ICompanyListItemField {
  id: number
  name: string
  company_list_id: number
  company_list?: ICompanyList
  required: boolean
  deleted_at?: string | null
  created_at: string
  updated_at: string
}
