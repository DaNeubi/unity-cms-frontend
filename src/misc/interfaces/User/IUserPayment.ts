import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IUserPayment extends IBaseObject {
  id: number
  payment_tip: number
  payment_share: number
  manually_added_payment_tip: number
  manually_added_payment_share: number
  making_user: number
  company_id: number
  created_at: string
  user_making: IUser
  user_receiving: IUser
  receiving_user: number
}
