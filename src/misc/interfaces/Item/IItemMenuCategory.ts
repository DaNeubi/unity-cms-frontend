import IBaseObject from '../IBaseObject'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import IItemCategory from './IItemCategory'

export default interface IItemMenuCategory extends IBaseObject {
  id: number
  item_id?: number
  item_category_id?: number
  item?: IItem
  item_category?: IItemCategory
  amount: number
  created_at?: string
  updated_at?: string
}
