import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompany from 'src/misc/interfaces/Company/ICompany'

export default interface IDocumentClassification extends IBaseObject {
  /**
   * the id of the company this document belongs to
   */
  company_id: number
  /**
   * the company this document belongs to
   */
  company: ICompany
  /**
   * name of the document classification
   */
  name: string
  /**
   * color of the document classification
   */
  color: string
  /**
   * when the document classification has been created
   */
  created_at: string
  /**
   * when the document classification has been updated
   */
  updated_at: string
}
