import IBaseObject from '../IBaseObject'
import ICompany from 'src/misc/interfaces/Company/ICompany'

export default interface IDocument extends IBaseObject {
  /**
   * the id of the company this document belongs to
   */
  company_id: number
  /**
   * the company this document belongs to
   */
  company: ICompany
  /**
   * name of the document type
   */
  name: string
  /**
   * when the document type has been created
   */
  created_at: string
  /**
   * when the document type has been updated
   */
  updated_at: string
}
