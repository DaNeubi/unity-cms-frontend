import IBaseObject from 'src/misc/interfaces/IBaseObject'
import { IItem } from 'src/misc/interfaces/Item/IItem'

export default interface ICompanyStatisticsItemAmount extends IBaseObject {
  item_id: number
  total_amount: number
  item?: IItem
}
