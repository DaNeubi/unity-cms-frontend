import IContract from 'src/misc/interfaces/Contract/IContract'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IContractItem extends IBaseObject {
  /**
   * id of the contract item
   */
  id: number
  /**
   * amount of the contract item
   */
  amount: number
  /**
   * max amount to set if enabled
   */
  max_amount?: number|null
  /**
   * min amount to set if enabled
   */
  min_amount?: number|null
  /**
   * sets the min amount
   */
  min_active: boolean
  /**
   * sets the max amount
   */
  max_active: boolean
  /**
   * if editable
   */
  editable: boolean
  /**
   * id of the contract
   */
  contract_id: number
  /**
   * contract
   */
  contract?: IContract
  /**
   * id of the item
   */
  item_id: number
  /**
   * item
   */
  item?: IItem
  /**
   * name of the item that is included in the contractItem.
   */
  name?: string
}
