import IBaseObject from 'src/misc/interfaces/IBaseObject'

export interface ICompanyTax extends IBaseObject {
  /**
   * Tax percentage
   */
  tax: number
  /**
   * Id of the tax
   */
  id: number
  /**
   * id of the company
   */
  company_id: number
}
