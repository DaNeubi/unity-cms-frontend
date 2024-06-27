import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import IUser from 'src/misc/interfaces/User/IUser'
import IDocument from '../IDocument'

export default interface IMedicalDocument extends IBaseObject {
  /**
   * the company id of the company this document belongs to
   */
  company_id: number
  /**
   * the company this document belongs to
   */
  company: ICompany
  /**
   * the id of the user that created the document
   */
  user_id: number
  /**
   * the user that created the document
   */
  user: IUser
  /**
   * id of the document this medical document belongs to
   */
  document_id: number
  /**
   * the document this medical document belongs to
   */
  document: IDocument
  /**
   * if this is a psychological document
   */
  psychological: boolean
  /**
   * triage content
   */
  triage: string
  /**
   * symptoms
   */
  symptoms: string
  /**
   * examination
   */
  examination: string
  /**
   * diagnosis
   */
  diagnosis: string
  /**
   * operation preparation
   */
  operationPreparation: string
  /**
   * treatment
   */
  treatment: string
  /**
   * medication
   */
  medication: string
  /**
   * discharge
   */
  discharge: string
  /**
   * follow up
   */
  followUp: string
  /**
   * follow up appointment date
   */
  followUpAppointment: string
  /**
   * if the patient is unable to work
   */
  unableToWork: boolean
  /**
   * if the patient is partly unable to work
   */
  partlyUnableToWork: boolean
  /**
   * if the patient is unable to work from
   */
  unableToWorkFrom: string
  /**
   * if the patient is unable to work to
   */
  unableToWorkTo: string
  /**
   * if the patient is suicidal, can only appear with a psychological document
   */
  suicidal: boolean
  /**
   * if the patient is suicidal, can only appear with a psychological document
   */
  psychologicalFollowUp: string
}
