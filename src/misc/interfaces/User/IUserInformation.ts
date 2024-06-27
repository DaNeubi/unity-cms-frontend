import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from 'src/misc/interfaces/User/IUser'
import IUserInformationField from 'src/misc/interfaces/User/IUserInformationField'

export default interface IUserInformation extends IBaseObject {
  /**
   * id of the user information
   */
  id: number
  /**
   * value of the user information encoded as string
   */
  value: string
  /**
   * id of the user this field belongs to
   */
  user_id: number
  /**
   * the user this field belongs to
   */
  user?: IUser
  /**
   * id of the user information field id
   */
  user_information_field_id: number
  /**
   * the user information field
   */
  user_information_field?: IUserInformationField
  /**
   * frontend ONLY
   * if the field is hidden or not
   */
  showHidden?:boolean
  created_at?: string
  updated_at?: string
}
