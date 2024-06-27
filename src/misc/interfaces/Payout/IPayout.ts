import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IPayout extends IBaseObject {
  /**
   * The id of the payout
   */
  id: number
  /**
   * total of the payout
   */
  total: number
  /**
   * note of the payout
   */
  note?: string
  /**
   * tip of the payout
   */
  tip: number
  /**
   * date of the payout
   */
  date?: string
  /**
   * actual payout of the payout
   */
  actual_payout: number
  /**
   * The id of the user who received the payout
   */
  receiver_user_id: number
  /**
   * The user who received the payout
   */
  receiver_user?: IUser
  /**
   * The id of the user who paid out the payout
   */
  payed_out_by_user_id: number
  /**
   * The user who paid out the payout
   */
  payed_out_by_user?: IUser
  /**
   * when the payout was created
   */
  created_at: string
  /**
   * when the payout was updated
   */
  updated_at: string
  /**
   * The id of the company the payout belongs to
   */
  company_id: number
}
