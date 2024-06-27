import IBaseObject from 'src/misc/interfaces/IBaseObject'
import User from 'src/misc/classes/User/User'
import Company from 'src/misc/classes/company/Company'

export default interface IDiscount extends IBaseObject {
  /**
   * id of the discount
   */
  id: number
  /**
   * name of the discount
   */
  name: string
  /**
   * description of the discount
   */
  description: string
  /**
   * amount of the discount
   */
  amount: number
  /**
   * is the discount active
   */
  active: boolean
  /**
   * is the discount deleted
   */
  deleted: boolean
  /**
   * the user that created the discount
   */
  user: User
  /**
   * the company that this discount belongs to
   */
  company: Company
  /**
   * when the discount was created
   */
  created_at: Date
  /**
   * the date the discount was updated
   */
  updated_at: Date
}
