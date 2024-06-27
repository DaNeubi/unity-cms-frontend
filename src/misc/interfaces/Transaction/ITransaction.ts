import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ITransactionItem from './ITransactionItem'
import TransactionType from 'src/misc/Enums/Transaction/TransactionType'
import IUser from 'src/misc/interfaces/User/IUser'
import ITransactionNonItem from 'src/misc/interfaces/Transaction/ITransactionNonItem'

export interface ITransaction extends IBaseObject {
  /**
   * ID of the transaction
   */
  id?: number
  /**
   * Id of the selected itemStock
   * undefined if non got selected
   */
  item_stock_id: number | undefined,
  /**
   * if a discount has been set
   */
  discount_id: number | undefined,
  /**
   * all the items that are in the transaction
   */
  items: ITransactionItem[] | undefined,
  /**
   * the amount of money the user gave to the user
   */
  amount_given: number,
  /**
   * the note that has been set or not
   */
  notes: string | undefined | null,
  /**
   * type of the transaction
   */
  type: TransactionType
  /**
   * optional user for the transaction
   */
  user?: IUser | undefined

  /**
   * the date when the transaction has been created
   */
  created_at?: Date | undefined

  /**
   * all the items in the transaction, only used if received from the server
   */
  transaction_items?: ITransactionItem[] | undefined
  /**
   * all the transaction non items
   */
  transaction_non_items?: ITransactionNonItem | undefined
}
