import IBaseObject from 'src/misc/interfaces/IBaseObject'
import OrderType from 'src/misc/Enums/OrderType/OrderType'

export interface ICompanySetting extends IBaseObject {
  /**
   * id of the companySetting
   */
  id: number
  /**
   * oder type for the company
   */
  order_type: OrderType
  /**
   * start date for the balance view
   */
  balance_view_start_date: string
  /**
   * duration for the balance view
   */
  balance_view_time_span: number
  /**
   * if in the cash register the prices will be rounded
   */
  cash_register_rounding: boolean
  /**
   * id of the company
   */
  company_id: number
  /**
   * threshold low number of the item stock
   */
  item_stock_threshold_low: number
  /**
   * threshold high number of the item stock
   */
  item_stock_threshold_high: number
  /**
   * primary color for the company
   */
  primary_color?: string | null
  /**
   * inspection interval for the company vehicles
   */
  inspection_interval?: number | null
  /**
   * when the companySetting was created
   */
  created_at: string
  /**
   * when the companySetting was updated
   */
  updated_at: string
}
