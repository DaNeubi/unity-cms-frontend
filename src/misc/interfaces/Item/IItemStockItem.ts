import { IItem } from 'src/misc/interfaces/Item/IItem'
import IBaseObject from '../IBaseObject'

export interface IItemStockItem extends IBaseObject{
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
  item_id: number
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
  item: IItem
  /**
   * when it got created
   */
  created_at: Date | undefined
  /**
   * total amount of the item that has been bought
   */
  bought?: number
  /**
   * total amount of the item that should be moved
   */
  move?: number
}
