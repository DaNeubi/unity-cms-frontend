import IItemType from 'src/misc/interfaces/Item/IItemType'
import IBaseObject from 'src/misc/interfaces/IBaseObject'

export interface IItemStockItemType extends IBaseObject {
  /**
   * id of the item stock item
   */
  id: number
  /**
   * how many should be in stock
   */
  wanted_amount: number
  /**
   * how much is currently in stock
   */
  current_amount: number
  /**
   * the item that is represented
   */
  item_type_id: number
  /**
   * the item stock this belongs to
   */
  item_stock_id: number
  /**
   * the company this belongs to
   */
  company_id: number
  /**
   * the actual item that is represented
   */
  item_type: IItemType
  /**
   * when it got created
   */
  created_at: Date | undefined
  /**
   * total amount of the item type that has been bought
   */
  bought?: number
  /**
   * total amount of the item type that should be moved
   */
  move?: number
 }
