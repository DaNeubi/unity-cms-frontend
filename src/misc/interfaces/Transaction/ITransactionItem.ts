import IBaseObject from '../IBaseObject'
import { IItem } from 'src/misc/interfaces/Item/IItem'

export interface ITransactionItem extends IBaseObject {
  /**
   * id of the item that is referenced
   */
  item_id: number,
  /**
   * amount of the item
   */
  amount: number
  /**
   * the item that is referenced
   */
  item?: IItem
  /**
   * id of the associated transaction
   */
  transaction_id?: number
  /**
   * selling price of the item at the time of the transaction
   */
  price?: number
  /**
   * purchase price of the item at the time of the transaction
   */
  purchase_price?: number
  /**
   * if the item was sold from a menu
   */
  from_menu?: boolean
}

export default ITransactionItem
