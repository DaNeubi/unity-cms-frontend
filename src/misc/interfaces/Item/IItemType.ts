import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IItemType extends IBaseObject {
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
}
