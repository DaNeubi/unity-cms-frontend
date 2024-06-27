import IBaseObject from '../IBaseObject'
import BloodType from 'src/misc/Enums/Medical/BloodType'

export default interface IPersonMedicalStatus extends IBaseObject {
  /**
   * if the person is dead, defaults to no
   */
  dead: number | boolean
  /**
   * if the person is in a psychological treatment, defaults to no
   */
  psychological_treatment: boolean | number
  /**
   * blood type of the person
   */
  blood_type: BloodType
  /**
   * the company this medical status belongs to
   */
  company_id: number
  /**
   * the person this medical status belongs to
   */
  person_id: number
}
