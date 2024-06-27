export default interface IDocumentField {
  /**
   * The ID of the field.
   */
  id: number
  /**
   * The name of the field.
   */
  name: string
  /**
   * The type of the field.
   */
  type: string
  /**
   * if the field is required
   */
  required: boolean | number
  /**
   * if the field is deprecated
   */
  deprecated: boolean | number
  /**
   * if the field is a template
   */
  has_template: boolean | number
  /**
   * if a permission is required to access the field
   */
  required_permission: string
  /**
   * if a module is required to access the field
   */
  required_module: string
}
