import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface ICompanyBalanceTransaction extends IBaseObject {
  id: number
  company_id: number
  deposit: number
  note: string
  amount: string
  created_at: string
  user_id: number
  user: IUser
}
