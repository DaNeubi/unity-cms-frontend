import IBaseObject from 'src/misc/interfaces/IBaseObject'
import { IItem } from './IItem'

export default interface IItemCategory extends IBaseObject {
  /**
   * id of the item category
   */
  id: number
  /**
   * name of the item category
   */
  name: string
  /**
   * color of the item category
   */
  color: string
  /**
   * description of the item category
   */
  description: string
  /**
   * time the item category was created
   */
  created_at: Date
  /**
   * all the items in the item category
   */
  items?: IItem[]
}
