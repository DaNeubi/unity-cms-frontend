import IBaseObject from '../IBaseObject'
import { ITransaction } from 'src/misc/interfaces/Transaction/ITransaction'
import IPerson from 'src/misc/interfaces/Person/IPerson'
import IDocumentType from './IDocumentType'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IDocument extends IBaseObject {
  /**
   * id of the document
   */
  id: string
  /**
   * the company id of the company this document belongs to
   */
  company_id: number
  /**
   * the company this document belongs to
   */
  company: ICompany
  /**
   * the id of the user that created the document
   */
  user_id: number
  /**
   * the user that created the document
   */
  user: IUser
  /**
   * the document type id
   */
  document_type_id?: number
  /**
   * the document type
   */
  document_type?: IDocumentType
  /**
   * if a transaction is associated with this document, this is the id
   */
  transaction_id?: number
  /**
   * the transaction
   */
  transaction?: ITransaction
  /**
   * the person this document belongs to (if any)
   */
  person_id?: number
  /**
   * the person that this document is associated with
   */
  person?: IPerson
  /**
   * if this document is deleted
   */
  deleted: boolean
  /**
   * if this document is shareable
   */
  shareable: boolean
  /**
   * the name of the document
   */
  name: string
  /**
   * the description of the document
   */
  description: string
  /**
   * if the document has been paid
   */
  paid: boolean
  /**
   * when the document is done
   */
  done_at: string
  /**
   * when the document has been created
   */
  created_at: string
  /**
   * when the document has been updated
   */
  updated_at: string
}
