import IBaseObject from '../IBaseObject'
import IItemMenuCategory from 'src/misc/interfaces/Item/IItemMenuCategory'

export default interface IItemMenu extends IBaseObject {
  /**
   * unique id of the intermed item menu
   */
  id: number
  /**
   * item menu category and the amounts with the items
   */
  item_menu_category?: IItemMenuCategory[] | undefined
  /**
   * id of the item
   */
  item_id: number
}
