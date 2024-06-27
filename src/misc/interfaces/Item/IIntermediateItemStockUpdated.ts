import IBaseObject from '../IBaseObject'
import { IItemStockItem } from 'src/misc/interfaces/Item/IItemStockItem'
import { IItemStockItemType } from 'src/misc/interfaces/Item/IItemStockItemType'

export interface IIntermediateItemStockUpdated extends IBaseObject {
  /**
   * company the itemStock belongs to
   */
  company_id?: number
  /**
   * id of the itemStock that has been changed
   */
  itemStock_id?: number
  /**
   * all itemStockItems that have been changed
   *
   * note: only the id of the item and the current amount are needed and have to be set
   */
  itemStockItems?: IItemStockItem[]
  /**
   * all itemStockItemTypes that have been changed
   *
   * note: only the id of the item and the current amount are needed and have to be set
   */
  itemStockItemTypes?: IItemStockItemType[]
}
