import { IItem } from 'src/misc/interfaces/Item/IItem'
import IContractOnHoldTransaction from './IContractOnHoldTransaction'

export default interface IContractOnHoldTransactionItem {
  /**
   * id of the contract on hold transaction item
   */
  id: number
  /**
   * amount of the contract on hold transaction item
   */
  amount: number
  /**
   * purchase price of the included item at that time
   */
  purchase_price: number
  /**
   * selling price of the included item at that time
   */
  selling_price: number
  /**
   * if user share is enabled for the item
   */
  user_share: number|boolean
  /**
   * id of the item
   */
  item_id: number
  /**
   * item
   */
  item?: IItem|null
  /**
   * id of the contract on hold transaction
   */
  cOhT_id: number
  /**
   * contract on hold transaction
   */
  cOhT?: IContractOnHoldTransaction|null
}
