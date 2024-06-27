import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface IUserManualAddRemove extends IBaseObject {
  id: number
  tip: number
  user_share: number
  note: string
  user_id: number
  user: IUser
  receiving_user: number
  user_receiving: IUser
  company_id: number
  created_at: string
  updated_at: string
}
