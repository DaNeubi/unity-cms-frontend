import IBaseObject from 'src/misc/interfaces/IBaseObject'
import Gender from 'src/misc/Enums/Gender/Gender'
import IUser from 'src/misc/interfaces/User/IUser'
import IPersonMedicalStatus from 'src/misc/interfaces/Person/IPersonMedicalStatus'

export default interface IPerson extends IBaseObject {
  /**
   * id of the person
   */
  id?: number
  /**
   * first name of the person
   */
  first_name?: string
  /**
   * last name of the person
   */
  last_name?: string
  /**
   * if the person married here is the last name the person had before marriage
   */
  birth_last_name?: string
  /**
   * phone number of the person
   */
  phone?: string
  /**
   * date of birth
   */
  date_of_birth?: string
  /**
   * gender of the person
   */
  gender?: Gender
  /**
   * id of the company
   */
  company_id: number
  /**
   * if associated with a user, this is the user id
   */
  user_id?: number
  /**
   * the user object
   */
  user?: IUser
  /**
   * when the person was created
   */
  created_at?: string
  /**
   * when the person was updated
   */
  updated_at?: string
  /**
   * if the person is an animal, defaults to no
   */
  animal: number | boolean
  /**
   * if the person has a medical status associated with them
   */
  person_medical_status?: IPersonMedicalStatus | null
}
