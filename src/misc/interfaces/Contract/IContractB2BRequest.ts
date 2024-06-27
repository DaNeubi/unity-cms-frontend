import IContract from 'src/misc/interfaces/Contract/IContract'
import ICompany from '../Company/ICompany'
import IUser from 'src/misc/interfaces/User/IUser'
import ContractB2BRequestStatus from 'src/misc/Enums/Contract/ContractB2BRequestStatus'

export default interface IContractB2BRequest {
  /**
   * Contract B2B Request ID
   */
  id: number
  /**
   * Contract ID
   */
  contract_id: number
  /**
   * Contract the request is about
   */
  contract?: IContract
  /**
   * id of the company that is receiving the request
   */
  customer_company_id: number
  /**
   * company that is receiving the request
   */
  customer_company?: ICompany
  /**
   * id of the user who created the request
   */
  user_id: number
  /**
   * user who created the request
   */
  user?: IUser
  /**
   * id of the user who accepted the request
   */
  responded_user_id?: number|null
  /**
   * user who accepted the request
   */
  responded_user?: IUser|null
  /**
   * status of the request
   */
  status: ContractB2BRequestStatus
  created_at?: string
  updated_at?: string
}
