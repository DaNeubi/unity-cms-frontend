import IBaseObject from '../IBaseObject'

export default interface IApplicantCustomFields extends IBaseObject {
  /**
   * id of the custom fields names
   */
  id: number
  /**
   * the company this custom fields belongs to
   */
  company_id?: number
  /**
   * header value name of the custom field
   */
  custom_field_1: string | null
  /**
   * header value name of the custom field
   */
  custom_field_2: string | null
  /**
   * header value name of the custom field
   */
  custom_field_3: string | null
  /**
   * header value name of the custom field
   */
  custom_field_4: string | null
  /**
   * header value name of the custom field
   */
  custom_field_5: string | null
  /**
   * header value name of the custom field
   */
  custom_field_6: string | null
  /**
   * when the object was created
   */
  created_at?: string
  /**
   * when the object was updated
   */
  updated_at?: string
}
