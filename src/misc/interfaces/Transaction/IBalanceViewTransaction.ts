import TransactionType from 'src/misc/Enums/Transaction/TransactionType'
import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IBalanceViewTransaction extends IBaseObject{
  /**
   * The id of the transaction
   */
  id: number
  /**
   * The id of the company the transaction belongs to
   */
  company_id: number
  /**
   * the amount of the discount
   */
  discount_amount: number
  /**
   * tax amount
   */
  tax: number
  /**
   * tip amount
   */
  tip: number
  /**
   * total amount
   */
  total: number
  /**
   * type of the transaction
   */
  type: TransactionType
  /**
   * id of the user the transaction belongs to
   */
  user_id: number
  /**
   * the amount of the user's share that has been given to the user
   */
  user_share_amount: number
}
