import ITransactionItem from 'src/misc/interfaces/Transaction/ITransactionItem'
import TransactionType from 'src/misc/Enums/Transaction/TransactionType'

export interface IEditedTransaction {
  /**
   * id of the transaction
   */
  id: number
  /**
   * id of the discount or undefined
   */
  discount_id: number | undefined
  /**
   * amount of the discount or undefined if no discount is available
   */
  discount_amount: number | undefined
  /**
   * note to the transaction or undefined if no note has been given
   */
  note: string | undefined
  /**
   * type of the transaction
   */
  type: TransactionType
  /**
   * tip of the transaction for the user
   */
  tip: number
  /**
   * total cost of the transaction
   */
  total: number
  /**
   * percentage of the tax
   */
  tax_percentage: number
  /**
   * if another creation date should be set
   */
  created_at: Date
  /**
   * all the items in the transaction
   * only the item_id and the amount are required
   */
  transaction_items?: ITransactionItem[] | undefined
}

export default IEditedTransaction
