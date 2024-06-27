import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompany from 'src/misc/interfaces/Company/ICompany'

export default interface IDocumentTemplate extends IBaseObject {
  /**
   * The ID of the document template
   */
  id: number
  /**
   * id of the company that owns the document template
   */
  company_id?: number
  /**
   * the company to the company id
   */
  company?: ICompany
  /**
   * The name of the document template
   */
  name: string
}
