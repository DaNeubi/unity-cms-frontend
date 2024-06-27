import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from 'src/misc/interfaces/User/IUser'

export default interface ICompanyOwner extends IBaseObject {
  user_id: number
  company_id: number
  user?: IUser
}
