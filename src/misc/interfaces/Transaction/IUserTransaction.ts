import IUser from 'src/misc/interfaces/User/IUser'
import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IUserTransaction extends IBaseObject {
  /**
   * id of the company
   */
  company_id: number
  /**
   * id of the user
   */
  user_id: number
  /**
   * the user that has the transactions
   */
  user: IUser
}
