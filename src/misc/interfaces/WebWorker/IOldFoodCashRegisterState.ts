import IDiscount from 'src/misc/interfaces/Discount/IDiscount'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import { IItem } from 'src/misc/interfaces/Item/IItem'

export default interface IOldFoodCashRegisterState {
  companyId: number
  selectedDiscount: undefined | IDiscount
  keepDiscountSelected: boolean
  selectedItemStock?: undefined | IItemStock
  useDefaultItemStock: boolean
  amountGiven: number
  note: string | undefined
  santosCardCode: number | undefined
  availableItems: undefined | IItem[]
}
