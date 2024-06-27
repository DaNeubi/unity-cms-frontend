import IBaseObject from 'src/misc/interfaces/IBaseObject'
import { IItemStockItem } from 'src/misc/interfaces/Item/IItemStockItem'
import { IItemStockItemType } from 'src/misc/interfaces/Item/IItemStockItemType'

export default interface IItemStock extends IBaseObject {
  /**
   * id of the item stock
   */
  id: number
  /**
   * name of the item stock
   */
  name: string
  /**
   * if the item stock is the default stock
   */
  is_default: number | boolean
  /**
   * company the item stock belongs to
   */
  company_id: number
  /**
   * all items that are in this stock
   */
  item_stock_items: IItemStockItem[]
  /**
   * all item types that are in this stock
   */
  item_stock_item_types: IItemStockItemType[]
  /**
   * total wanted amount of all items in this stock
   * ONLY AVAILABLE IN OVERVIEW
   */
  item_stock_total_wanted?: number
  /**
   * total available amount of all items in this stock
   * ONLY AVAILABLE IN OVERVIEW
   */
  item_stock_total_available?: number
}
