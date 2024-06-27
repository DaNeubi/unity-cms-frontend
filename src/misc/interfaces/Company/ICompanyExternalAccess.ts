import IBaseObject from 'src/misc/interfaces/IBaseObject'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import GovernmentArea from 'src/misc/Enums/Government/GovernmentArea'
import IUser from 'src/misc/interfaces/User/IUser'
import ExternalAccessRequestStatus from 'src/misc/Enums/ExternalAccess/ExternalAccessRequestStatus'

export default interface ICompanyExternalAccess extends IBaseObject {
  /**
   * The id of the company external access
   */
  id: number
  /**
   * The id of the company this access is for
   */
  company_id: number
  /**
   * the company this access is for
   */
  company?: ICompany
  /**
   * the area this access is for
   */
  area: number | GovernmentArea
  /**
   * when the access will expire
   */
  expires_at?: string | null
  /**
   * a note for the access
   */
  note?: string
  /**
   * if the access was granted by a resolution
   */
  resolution: boolean
  /**
   * status of the access request
   */
  status: ExternalAccessRequestStatus
  /**
   * the user id that requested the access
   */
  requested_by_id: number
  /**
   * the user that requested the access
   */
  requested_by?: IUser
  /**
   * the user id that granted the access
   */
  granted_by_id?: number
  /**
   * the user that granted the access
   */
  granted_by?: IUser
}
