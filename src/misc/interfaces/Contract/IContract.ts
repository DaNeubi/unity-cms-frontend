import ICompany from 'src/misc/interfaces/Company/ICompany'
import IUser from 'src/misc/interfaces/User/IUser'
import IContractSetting from 'src/misc/interfaces/Contract/IContractSetting'
import IContractItem from 'src/misc/interfaces/Contract/IContractItem'
import IContractOnHoldTransaction from 'src/misc/interfaces/Contract/IContractOnHoldTransaction'

export default interface IContract {
  /**
   * Contract ID
   */
  id: number
  /**
   * Contract name
   */
  name: string
  /**
   * Contract customer (not a company)
   */
  customer?: string|null
  /**
   * contract number
   */
  number: number
  /**
   * Contract description or note
   */
  description: string|null
  /**
   * amount of discount for every transaction
   */
  discount_amount: number
  /**
   * start date of contract
   */
  start_date: string
  /**
   * start date of the billing period
   */
  billing_start_date: string
  /**
   * duration for a billing period
   */
  billing_duration: number
  /**
   * soft delete
   */
  deleted: boolean
  /**
   * if the contract is b2b
   */
  b2b: boolean
  /**
   * company id if the contract is b2b
   */
  customer_company_id?: number|null
  /**
   * company if the contract is b2b
   */
  customer_company?: ICompany|null
  /**
   * if a user share will be applied
   */
  user_share: boolean
  /**
   * if items can be added while booking for the contract
   */
  items_addable: boolean
  /**
   * id of the user who created the contract
   */
  user_id: number
  /**
   * user who created the contract
   */
  user?: IUser
  /**
   * id of the company the contract belongs to
   */
  company_id: number
  /**
   * company the contract belongs to
   */
  company?: ICompany
  /**
   * settings for the contract
   */
  contract_setting?: IContractSetting
  /**
   * items for the contract
   */
  contract_items?: IContractItem[]
  /**
   * all open transactions for the contract
   */
  contract_transactions?: IContractOnHoldTransaction[]
  /**
   * all the contract on hold transactions for the contract
   */
  contract_on_hold_transactions?: IContractOnHoldTransaction[]
  /**
   * the total amount of money that is stale for the contract
   */
  stale_money?: number
  created_at?: string
  updated_at?: string
}
