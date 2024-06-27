import IBaseObject from 'src/misc/interfaces/IBaseObject'
import IUser from '../User/IUser'

export default interface IApplicant extends IBaseObject {
  /**
   * id of the object
   */
  id: number
  /**
   * id of the user that created the applicant
   */
  user_id?: number
  /**
   * the user if set
   */
  user?: IUser
  /**
   * id of the company the applicant belongs to
   */
  company_id: number
  /**
   * if the applicant is hidden
   */
  hidden: boolean
  /**
   * first name of the applicant
   */
  first_name: string
  /**
   * last name of the applicant
   */
  last_name: string
  /**
   * phone number of the applicant
   */
  phone_number: string
  /**
   * custom field 1 | text
   */
  custom_field_1: string
  /**
   * custom field 2 | text
   */
  custom_field_2: string
  /**
   * custom field 3 | text
   */
  custom_field_3: string
  /**
   * custom field 4 | boolean
   */
  custom_field_4: boolean
  /**
   * custom field 5 | boolean
   */
  custom_field_5: boolean
  /**
   * custom field 6 | boolean
   */
  custom_field_6: boolean
  /**
   * if the applicant got hired, here's the date
   */
  employment_start: string
  /**
   * date the applicant got created
   */
  created_at: string
  /**
   * date the applicant got updated
   */
  updated_at: string
}
