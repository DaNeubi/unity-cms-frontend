import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IDynamicField from 'src/misc/interfaces/DynamicField/IDynamicField'

export default interface IUserInformationField extends IBaseObject {
  /**
   * id of the user information field
   */
  id: number
  /**
   * name of the user information field
   */
  name: string
  /**
   * id of the dynamic field
   */
  dynamic_field_id: number
  /**
   * dynamic field
   */
  dynamic_field: IDynamicField
  /**
   * if the user information field is required
   */
  required: boolean | number
  /**
   * if the user information field is deprecated
   */
  deprecated: boolean | number
}
