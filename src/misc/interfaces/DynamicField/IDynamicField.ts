import IBaseObject from 'src/misc/interfaces/IBaseObject'

export default interface IDynamicField extends IBaseObject {
  /**
   * The id of the dynamic field
   */
  id: number
  /**
   * The name of the dynamic field
   */
  name: string
  /**
   * The type of the dynamic field
   */
  type: string
  /**
   * if the dynamic field is deprecated
   */
  deprecated: boolean
  /**
   * if any permissions are required to access the dynamic field
   */
  required_permissions?: string | null | undefined
  /**
   * if any modules are required to access the dynamic field
   */
  required_modules?: string | null | undefined
}
