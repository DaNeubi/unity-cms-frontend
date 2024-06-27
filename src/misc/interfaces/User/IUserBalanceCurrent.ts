import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IUserBalanceCurrent extends IBaseObject {
  /**
   * id of the user balance current
   */
  id: number
  /**
   * current tip amount
   */
  current_tip: number
  /**
   * current share amount
   */
  current_share: number
  /**
   * manually added tip amount
   */
  manually_added_tip: number
  /**
   * manually added share amount
   */
  manually_added_share: number
  /**
   * id of the user this belongs to
   */
  user_id: number
  /**
   * id of the company this belongs to
   */
  company_id: number
  /**
   * amount of cash payments
   */
  cash_payment_sum: number
}
