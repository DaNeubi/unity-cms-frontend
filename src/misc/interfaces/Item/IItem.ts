import IItemType from 'src/misc/interfaces/Item/IItemType'
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IItemMenuCategory from './IItemMenuCategory'
import IItemMenu from 'src/misc/interfaces/Item/IItemMenu'

export interface IItem extends IBaseObject {
  /**
   * id of the item
   */
  id: number
  /**
   * name of the item
   */
  name: string
  /**
   * description of the item
   */
  description: string
  /**
   * if a discount is available
   */
  discount_available: boolean
  /**
   * purchase price of the item
   */
  purchase_price: number
  /**
   * selling price of the item
   */
  selling_price: number
  /**
   * if the item is active
   */
  active: boolean
  /**
   * if the item is deleted
   */
  deleted: boolean
  /**
   * order number if the item
   */
  order_number: number
  /**
   * if the item will create a purchase if sold
   */
  expense_on_sale: boolean
  /**
   * if the item has a user share
   */
  user_share: boolean
  /**
   * if the item is a menu
   */
  menu: boolean
  /**
   * the company id of the item
   */
  company_id: number
  /**
   * the item type id of the item
   */
  item_type_id: number
  /**
   * the item type of the item
   */
  item_type: IItemType
  /**
   * the item category id of the item
   */
  item_category_id: number
  /**
   * the item category of the item
   */
  item_category: IItemCategory
  /**
   * the created at date of the item
   */
  created_at: Date
  /**
   * the updated at date of the item
   */
  updated_at: Date

  /**
   * FRONTEND ONLY
   */
  /**
   * The amount of the item currently selected
   */
  amount: number
  /**
   * available menu categories
   */
  item_menu_categories?: IItemMenuCategory[]
  /**
   * all configured menus
   */
  item_menus?: IItemMenu[]
}
